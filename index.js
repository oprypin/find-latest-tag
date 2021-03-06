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

        // It's somewhat safe to assume that the most recenly created release is actually latest.
        const sortTagsDefault = (releasesOnly ? "false" : "true");
        const sortTags = (core.getInput("sort-tags") || sortTagsDefault).toLowerCase() === "true";

        core.setOutput("tag", await getLatestTag(owner, repo, releasesOnly, prefix, regex, sortTags));
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
    if (tags.length === 0) {
        let error = `The repository "${owner}/${repo}" has no `;
        error += releasesOnly ? "releases" : "tags";
        if (prefix) {
            error += ` matching "${prefix}*"`;
        }
        throw error;
    }
    tags.sort(cmpTags);
    const [latestTag] = tags.slice(-1);
    return latestTag;
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
