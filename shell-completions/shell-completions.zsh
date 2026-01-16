# Zsh completion for jutge CLI
#
# RECOMMENDED: Use the built-in installer instead of sourcing this file:
#
#   jutge completions install
#
# This will automatically:
# - Detect your shell (bash/zsh)
# - Install the completion script to ~/.local/share/jutge-cli/completions/
# - Add the source line to your ~/.zshrc
#
# To uninstall:
#   jutge completions uninstall
#
# To check status:
#   jutge completions status
#
# ============================================================================
# Manual installation (if you prefer):
# Add this to your ~/.zshrc:
#   source /path/to/shell-completions.zsh
# ============================================================================

_complete_jutge_zsh() {
    local word_string="${words[*]}"
    local completions=(${(f)"$(jutge completions "$CURRENT" "$word_string" 2>/dev/null)"})
    compadd -- "${completions[@]}"
}

if [ -n "${ZSH_VERSION:-}" ]; then
    autoload -Uz compinit
    compinit -u
    compdef _complete_jutge_zsh jutge
fi
