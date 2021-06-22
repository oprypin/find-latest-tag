const core = require("@actions/core");
const {Octokit} = require("@octokit/rest");
const {cmpTags} = require("tag-cmp");

async function run() {
    try {
        const repository = core.getInput("repository", {required: true});
        const repoParts = repository.split("/");
        if (repoParts.length !== 2) {
            throw `Invalid repository "${repository}" (needs to have one slash)`;
        }
        const [owner, repo] = repoParts;

        const prefix = core.getInput("prefix") || "";
        const regex = core.getInput("regex") || null;

        const releasesOnly = (core.getInput("releases-only") || "false").toLowerCase() === "true";
        const comparedValue = core.getInput("compared-to-tag") || "";

        // It's somewhat safe to assume that the most recenly created release is actually latest.
        const sortTagsDefault = (releasesOnly ? "false" : "true");
        const sortTags = (core.getInput("sort-tags") || sortTagsDefault).toLowerCase() === "true";

        let latestTag = await getLatestTag(owner, repo, releasesOnly, prefix, regex, sortTags);
        core.setOutput("tag", latestTag);
        core.info(`tag: ${latestTag}`);

        // Get comaresTo object, and set outputs if not empty
        if (latestTag && comparedValue) {
            let comp = compareRefOrTag(comparedValue, latestTag, regex);
            for (let outputName in comp) {
                core.setOutput(outputName, comp[outputName]);
                core.info(`${outputName}: ${comp[outputName]}`);
            }
        }
    } catch (error) {
        core.setFailed(error);
    }
}

const octokit = new Octokit({auth: core.getInput("token") || null});

async function getLatestTag(owner, repo, releasesOnly, prefix, regex, sortTags) {
    const endpoint = (releasesOnly ? octokit.repos.listReleases : octokit.repos.listTags);
    const pages = endpoint.endpoint.merge({"owner": owner, "repo": repo, "per_page": 100});

    const tags = [];
    for await (const item of getItemsFromPages(pages)) {
        const tag = (releasesOnly ? item["tag_name"] : item["name"]);
        if (!tag.startsWith(prefix)) {
            continue;
        }
        if (regex && !new RegExp(regex).test(tag)) {
            continue;
        }
        if (!sortTags) {
            // Assume that the API returns the most recent tag(s) first.
            return tag;
        }
        tags.push(tag);
    }

    // Notify that no tags/releases have been found
    if (tags.length === 0) {
        let warn = `The repository "${owner}/${repo}" has no `;
        warn += releasesOnly ? "releases" : "tags";
        if (prefix) {
            warn += ` matching "${prefix}*"`;
        }
        core.warning(warn);
        return "";
    }

    tags.sort(cmpTags);
    const [latestTag] = tags.slice(-1);

    return latestTag;
}

function compareRefOrTag(tagRef, val, regex = "") {
    // strip of the refs prefix
    const tag = tagRef.replace(/refs\/(heads|tags)\//, "");

    // don't respect value which doesn't match the regex
    if (regex && !new RegExp(regex).test(tag)) {
        return {};
    }

    let cmpres = cmpTags(tag, val);
    return {
        equal: cmpres === 0,
        newer: cmpres === 1,
        older: cmpres === -1,
    };
}

async function* getItemsFromPages(pages) {
    for await (const page of octokit.paginate.iterator(pages)) {
        for (const item of page.data) {
            yield item;
        }
    }
}

if (require.main === module) {
    run();
}
