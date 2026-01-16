# Zsh completion for jutge CLI
#
# To enable, add this to your ~/.zshrc:
#   source /path/to/shell-completions.zsh
#
# Or copy to a directory in your $fpath

_complete_jutge_zsh() {
    # CURRENT is the 1-based index of the word being completed
    # words is the array of words in the command line
    # Join words into a single space-separated string
    local word_string="${words[*]}"
    
    # Get completions from jutge (suppress stderr)
    local completions=(${(f)"$(jutge completions "$CURRENT" "$word_string" 2>/dev/null)"})
    
    # Add completions
    compadd -- "${completions[@]}"
}

# Only set up if running in zsh
if [ -n "${ZSH_VERSION:-}" ]; then
    autoload -Uz compinit
    compinit -u
    compdef _complete_jutge_zsh jutge
fi
