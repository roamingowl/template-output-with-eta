# Render template to output variable with Eta

[![GitHub Super-Linter](https://github.com/roamingowl/template-output/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/roamingowl/template-output/actions/workflows/ci.yml/badge.svg)
[![CodeQL](https://github.com/roamingowl/template-output/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

Node.js action that renders string template into an output variable using [ETA library](https://eta.js.org/). 

## Inputs
Mandatory:  
`template` [string]: Template string to render (Supports [ETA](https://eta.js.org/) syntax). Or a path to file containing template.

Optional:
`variables` [string]: Variables to substitute in the template. You can use YAML, JSON or dotenv format. 

`varName` [string]: Name of the variable which holds all data to be used in the template (variables). Default: `it`.

## Enhancements
You can use functions from [date-fns](https://date-fns.org/) library to format dates inside the template.
Use any function with utils.dateFns prefix. For example, to format date you can use `utils.dateFns.format(it.date, "MM/dd/yyyy HH:mm:ss")`.

Additionally, to the default functions, you can use [UTCDateMini](https://github.com/date-fns/utc#readme) to work with UTC date objects.
You can use this class directly (without utils prefix). For example, to format date you can use `UTCDateMini(it.date)`.

> Note: Heavier alternative `UTCDate` class is not available in this action for now.

Example formatting timestamp:
```yaml
steps:
  - name: Render template with formatted date
    uses: roamingowl/template-output@v1
    with:
      template: |
        Formatted date is <%= utils.dateFns.format(new UTCDateMini(it.timestamp * 1000), "MM/dd/yyyy HH:mm:ss") %>
      variables: |
        timestamp: 1711187861
```

will produce output like:
```
Formatted date is 03/23/2024 09:57:41
```

## Usage examples

Variables in YAML format:
```yaml
steps:
  - name: Render simple template with variables in YAML format
    uses: roamingowl/template-output@v1
    with:
      template: |
        <%= it.what %> this is <%= it.name %>
      variables: |
        name: 'John'
        what: 'hi'
```

Variables in JSON format:
```yaml
steps:
  - name: Render simple template with variables in JSON format
    uses: roamingowl/template-output@v1
    with:
      template: |
        <%= it.what %> this is <%= it.name %>
      variables: |
        { "what": "hi", "name": "John" }
```

Variables in dotenv format:
```yaml
steps:
  - name: Render simple template with variables in JSON format
    uses: roamingowl/template-output@v1
    with:
      template: |
        <%= it.WHAT %> this is <%= it.NAME %>
      variables: |
        WHAT=hi
        NAME=John
```

Load template from file:
```yaml
steps:
  - name: Render simple template from file
    uses: roamingowl/template-output@v1
    with:
      template: ./template.txt
      variables: |
        what: hi
        name: John
```

Print date difference between two timestamps in minutes:
```yaml
steps:
  - name: Render difference between two timestamps in minutes
    uses: roamingowl/template-output@v1
    with:
      template: |
        The difference is <%= Math.abs(utils.dateFns.differenceInMinutes(new Date(it.t1 * 1000), new Date(it.t2 * 1000))) %> minutes
      variables: |
        t1: 1711187861
        t2: 1711188041
```

# License
The scripts and documentation in this project are released under the [MIT License](LICENSE)