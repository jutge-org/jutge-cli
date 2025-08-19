_complete_jutge_zsh() {
    compadd -- $(jutge completions $CURRENT "${words}")
}

if [ -n "${ZSH_VERSION:-}" ]; then
    autoload -Uz compinit
    compinit
    compdef _complete_jutge_zsh jutge
fi
