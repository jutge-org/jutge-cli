# Bash completion for jutge CLI
#
# RECOMMENDED: Use the built-in installer instead of sourcing this file:
#
#   jutge completions install
#
# This will automatically:
# - Detect your shell (bash/zsh)
# - Install the completion script to ~/.local/share/jutge-cli/completions/
# - Add the source line to your ~/.bashrc
#
# To uninstall:
#   jutge completions uninstall
#
# To check status:
#   jutge completions status
#
# ============================================================================
# Manual installation (if you prefer):
# Add this to your ~/.bashrc:
#   source /path/to/shell-completions.bash
# ============================================================================

_complete_jutge_bash() {
    local index=$((COMP_CWORD + 1))
    local words="${COMP_WORDS[*]}"
    local IFS=$'\n'
    local completions=($(jutge completions "$index" "$words" 2>/dev/null))
    COMPREPLY=($(compgen -W "${completions[*]}" -- "${COMP_WORDS[COMP_CWORD]}"))
}

if [ -n "${BASH_VERSION:-}" ]; then
    complete -F _complete_jutge_bash jutge
fi
