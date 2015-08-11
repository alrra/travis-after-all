#!/bin/bash

git_commit() {
    git add -A \
        && git commit -m "v$1"
}

git_tag() {
    git tag -a "$1" -m "v$1"
}

git_tag_exists() {

    git ls-remote --tags 2> /dev/null | grep "$1$" &> /dev/null \
        || git show-ref --tags 2> /dev/null | grep "$1$" &> /dev/null

    return $?

}

is_valid_version() {
    [[ "$1" =~ ^[[:digit:]]+\.[[:digit:]]+\.[[:digit:]]+$ ]] \
        && return 0 \
        || return 1
}

update() {

    declare -r FILE="$1"
    declare -r TMP_FILE="/tmp/$(mktemp -u XXXXX)"
    declare -r UPDATE_FUNCTION="$2"
    declare -r VERSION="$3"

    [ ! -f "$FILE" ] \
        && return 1

    $($UPDATE_FUNCTION "$FILE" "$VERSION" "$TMP_FILE") \
        && mv "$TMP_FILE" "$FILE" \
        && rm -rf "$TMP_FILE"

    return $?

}

update_changelog() {

    declare -r DATE="$(date +"%B %-d, %Y")"
    declare -r RELEASE_HEADER="$2 ($DATE)"

    cat "$1" | grep "HEAD" &> /dev/null;

    if [ $? -eq 0 ]; then
        cat "$1" | sed "s/HEAD/$RELEASE_HEADER/g" > "$3"
    else
        printf "### %s\n\n" "$RELEASE_HEADER" | cat - "$1" > "$3"
    fi

}

update_package_json() {
    npm --quiet version "$1" --no-git-tag-version
}

update_readme() {
    cat "$1" | sed 's/\([0-9.]*\)\(\/lib\)/'$2'\2/' > "$3"
}

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

main() {

    declare -r VERSION="$1"

    if [ -z "$VERSION" ]; then
        printf 'Please specify a version number!\n'
        exit 1
    fi

    if ! is_valid_version "$VERSION"; then
        printf 'Please specify a valid version number!\n'
        exit 1
    fi

    if git_tag_exists "$VERSION"; then
        printf "Tag '$VERSION' already exists!\n"
        exit 1
    fi

    update_package_json "$VERSION" \
        && update "CHANGELOG.md" "update_changelog" "$VERSION" \
        && update "README.md" "update_readme" "$VERSION" \
        && git_commit "$VERSION" \
        && git_tag "$VERSION"

}

main "$@"
