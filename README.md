find-latest-tag
===============

[GitHub Action][] to **find the latest tag in a GitHub repository**

## Examples

```yaml
steps:
  - uses: oprypin/find-latest-tag@v1
    with:
      repository: octokit/rest.js  # The repository to scan.
      releases-only: true  # We know that all relevant tags have a GitHub release for them.
    id: octokit  # The step ID to refer to later.

  - run: echo "Octokit is at version ${{ steps.octokit.outputs.tag }}"

  - uses: actions/checkout@v4
    with:
      repository: octokit/rest.js  # Download that repository.
      ref: ${{ steps.octokit.outputs.tag }}  # At the latest released version, found earlier.
```

```yaml
steps:
  - uses: oprypin/find-latest-tag@v1
    with:
      repository: slembcke/Chipmunk2D
      # releases-only: false  # This repository doesn't use GitHub's "release" feature.
      prefix: 'Chipmunk-7.'  # Other kinds of tags are irrelevant; also limit to major version 7.
    id: chipmunk_version
```

Compare with the current github ref:

```yaml
steps:
  - uses: oprypin/find-latest-tag@v1
    id: upstream-latest
    with:
      repository: cloudflare/wrangler
      compare-to: ${{ github.ref }}
  - run: |
      echo "Upstream latest tag is equal (than this github.ref): ${{ steps.upstream-latest.outputs.equal }}"
      echo "Upstream latest tag is newer (than this github.ref): ${{ steps.upstream-latest.outputs.equal }}"
      echo "Upstream latest tag is older (than this github.ref): ${{ steps.upstream-latest.outputs.equal }}"
```

[Find usages in the wild!](https://github.com/search?l=YAML&q=%22oprypin%2Ffind-latest-tag%22&type=Code)

## Usage

### Inputs

* **`repository: username/reponame`**

  **Required.** Name of a repository on GitHub, with owner; this refers to https://github.com/username/reponame.git.

* **`releases-only: true`**

  Consider only tags that have an associated release.

* **`releases-only: false`** (default)

  Consider all tags.

* **`prefix: 'someprefix-'`**

  Consider only tags starting with this string prefix, like "someprefix-1.2.3". The prefix will **not** be excluded from the result.

* **`regex: 'regex pattern'`**

  Consider only tags that match the specified regular expression pattern (not anchored).
  For example, `regex: '^\d+\.\d+\.\d+$'` matches tags such as `1.2.3` etc.

* **`sort-tags: true`** (default)

  Look through all tags to find the one with the [greatest (semver-like) version](#version-precedence).

* **`sort-tags: false`** (default for `releases-only: true`)

  Return the first tag reported by GitHub. It's safe to rely on this being the **most recently created** release only for `releases-only: false`. When looking at tags, the behavior is undefined.

* **`compare-to: 'v1.2.3'`** (default for `compare-to: ''`)

  Compare the repository latest tag with the version provied (ex. v1.2.3). Note that ${{ github.ref }} is also supported. If the latest tag in the given repository found then it is compared to the `compare-to` value. Result is stored into `newer`/`older`/`equal` can be `true`, `false` or *the output can be omitted*.

* **`token: ${{ secrets.PERSONAL_TOKEN }}`**

  Required for scanning tags of **other private repositories** (referred to as *destination* repo), because the default `GITHUB_TOKEN` only gives access to the repository that's *running* the action (and public ones).

  Then a user that has access to the destination repository needs to [create](https://github.com/settings/tokens/new) a [personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) with `repo` access, and that token's value should be [added as a repository secret](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository) to the *running* repository under the name "`PERSONAL_TOKEN`".

  See also: [Example](https://github.com/oprypin/find-latest-tag/blob/85ce4ccf033896cde4cd274773bacb49758cca11/.github/workflows/release.yml#L26-L31), [Security considerations](https://docs.github.com/en/actions/learn-github-actions/security-hardening-for-github-actions#considering-cross-repository-access).

### Outputs

* **`tag`** (`${{ steps.some_step_id.outputs.tag }}`)

  The tag that was found is made available as the step's output.

* **`newer`** (`${{ steps.some_step_id.outputs.newer }}`)

  If the latest tag found (in the given repository) is newer than specifed `compare-to` value then result is `true` otherwise `false`. Output can be omitted which indicates that the latest tag hasn't been found due to absence or filtered out be means of `regex`, `prefix` or other parameters.

* **`older`** (`${{ steps.some_step_id.outputs.older }}`)

  Similar to the `newer` output.

* **`equal`** (`${{ steps.some_step_id.outputs.equal }}`)

  Similar to the `newer` output.

### Errors

The action exits with an error if:

* the `repository` input is invalid;
* any HTTP error happens;
    * the repository doesn't exist;
    * the repository isn't public;
* no tags (or releases, if that's what chosen) are found;
* none of the tags match the `prefix`.

## Version precedence

The action looks at tags in [natural sort order][] (i.e. lexicographic with the consideration of multi-digit numbers), with a special exception for "pre-release identifiers" (letters that immediately follow a number).

Example in ascending order:

* `v1.3` (goes first just because others don't have the "v")
* `1.1.2` (lowest minor version)
* `1.2rc1` (precedes the following as a "release candidate" of 1.2)
* `1.2` (actual release)
* `1.2.1` (patch release)
* `1.11` (much later version; `11 > 2` even if `'1' < '2'`)

(and so `1.11` would be chosen as the "greatest").

This handling is compatible with [SemVer][], but more general.

There is no attempt to isolate the version number from other text that may be part of the tag name. But that's not a problem if the tags have a matching prefix, e.g. `Release-1.2.3` and `Release-1.2.4`. But, `Foo-3.4.5` would precede these just because `'F' < 'R'`.


[github action]: https://github.com/features/actions
[natural sort order]: https://en.wikipedia.org/wiki/Natural_sort_order
[semver]: https://semver.org/
