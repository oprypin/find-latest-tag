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

  - uses: actions/checkout@v2
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

## Usage

### Inputs

* **`repository: username/reponame`**

  **Required.** Name of a repository on GitHub, with owner; this refers to https://github.com/username/reponame.git.

* **`prefix: 'someprefix-'`**

  Consider only tags starting with this string prefix, like "someprefix-1.2.3". The prefix will **not** be excluded from the result.

* **`releases-only: true`**

  Consider only tags that have an associated release.

* **`releases-only: false`** (default)

  Consider all tags.

* **`sort-tags: true`** (default)

  Look through all tags to find the one with the [greatest (semver-like) version](#version-precedence).

* **`sort-tags: false`** (default for `releases-only: true`)

  Return the first tag reported by GitHub. It's safe to rely on this being the **most recently created** release only for `releases-only: false`. When looking at tags, the behavior is undefined.

### Outputs

* **`tag`** (`${{ steps.some_step_id.outputs.tag }}`)

  The tag that was found is made available as the step's output.

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
