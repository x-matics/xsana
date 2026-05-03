#compdef xsana

_xsana() {
  local -a commands
  commands=(
    'setup:Set up a new xsana project in the current directory'
    'create:Create a new Asana script from template'
    'run:Run an existing Asana script locally'
    'update-agents:Fetch latest API methods and update agents.md'
    'completion:Output shell completion script for eval'
  )

  _arguments -C \
    '1:command:->command' \
    '*::arg:->args'

  case "$state" in
    command)
      _describe -t commands 'xsana command' commands
      ;;
    args)
      case "$words[1]" in
        run|create)
          if [ -d "scripts" ]; then
            local -a scripts
            scripts=(${(f)"$(ls -1 scripts/ 2>/dev/null)"})
            _describe -t scripts 'script' scripts
          fi
          ;;
      esac
      ;;
  esac
}

_xsana
