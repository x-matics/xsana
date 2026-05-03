_xsana_completions() {
  local cur prev commands
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  commands="setup create run update-agents completion"

  if [ "$COMP_CWORD" -eq 1 ]; then
    COMPREPLY=( $(compgen -W "$commands" -- "$cur") )
    return 0
  fi

  case "$prev" in
    run|create)
      if [ -d "scripts" ]; then
        local scripts=$(ls -1 scripts/ 2>/dev/null)
        COMPREPLY=( $(compgen -W "$scripts" -- "$cur") )
      fi
      return 0
      ;;
  esac
}

complete -F _xsana_completions xsana
