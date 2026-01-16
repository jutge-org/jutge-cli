# Bash completion for jutge CLI
#
# To enable, add this to your ~/.bashrc:
#   source /path/to/shell-completions.bash
#
# Or copy to /etc/bash_completion.d/jutge (may require sudo)

_complete_jutge_bash() {
    # COMP_CWORD is 0-based index of the word being completed
    # COMP_WORDS is the array of words in the command line
    # We convert to 1-based index for consistency with zsh
    local index=$((COMP_CWORD + 1))
    
    # Join all words into a single space-separated string
    local words="${COMP_WORDS[*]}"
    
    # Get completions from jutge
    local IFS=$'\n'
    local completions=($(jutge completions "$index" "$words" 2>/dev/null))
    
    # Generate reply based on current word prefix
    COMPREPLY=($(compgen -W "${completions[*]}" -- "${COMP_WORDS[COMP_CWORD]}"))
}

# Only set up if running in bash
if [ -n "${BASH_VERSION:-}" ]; then
    complete -F _complete_jutge_bash jutge
fi
