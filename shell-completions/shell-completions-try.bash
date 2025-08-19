_generate_jutge_completions() {
    >&2 echo "\n>> jutge completions $@ $PREFIX"
    jutge completions $@
}

_complete_jutge_bash() {
    >&2 echo "Bash!!"
    local IFS=$'\n'
    local raw=($(_generate_jutge_completions "$COMP_CWORD" "${COMP_WORDS[@]}"))
    local trimmed=()
    trimmed+=( "${raw[@]}" )

    if (( ${#raw[@]} == 1 )); then
        trimmed+=( "${raw[0]%%:*}" )
    fi

    COMPREPLY=( "${trimmed[@]}" )
}

_complete_jutge_zsh() {
    >&2 echo "\nZsh!! $CURRENT ${words[@]}"
    local -a raw trimmed
    local IFS=$'\n'

    raw=($(_generate_jutge_completions "$CURRENT" "${words[@]}"))
    for d in $raw; do
        trimmed+=( "${d%%:*}" );
    done

    if (( ${#raw} == 1 )); then
        trimmed+=( "${raw[1]}" )
        raw+=( "${trimmed[1]}" )
    fi

    compadd -d raw -- $trimmed
}

if [ -n "${ZSH_VERSION:-}" ]; then
    autoload -Uz compinit
    compinit
    compdef _complete_jutge_zsh jutge
elif [ -n "${BASH_VERSION:-}" ]; then
    complete -F _complete_jutge_bash jutge
fi
