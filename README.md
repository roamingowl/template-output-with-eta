# Render template to output variable with Eta

![CI](https://github.com/roamingowl/template-output/actions/workflows/ci.yml/badge.svg)
[![CodeQL](https://github.com/roamingowl/template-output/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/roamingowl/template-output/actions/workflows/codeql-analysis.yml)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=roamingowl_template-output-with-eta&metric=coverage)](https://sonarcloud.io/summary/new_code?id=roamingowl_template-output-with-eta)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=roamingowl_template-output-with-eta&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=roamingowl_template-output-with-eta)
![Esbuild Badge](https://img.shields.io/badge/esbuild-^0.23.0-FFCF00)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=roamingowl_template-output-with-eta&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=roamingowl_template-output-with-eta)


## Description
Node.js action that renders string template into an output variable using [ETA library](https://eta.js.org/).  

## Inputs

| name | description                                                                                                              | type | required | default |
| --- |--------------------------------------------------------------------------------------------------------------------------|---------------| --- |---|
| `template` | <p>Template string to render (Supports [ETA](https://eta.js.org/) syntax). Or a path to file containing template.</p>    | `string` | `true`        | `""` |
| `varName` | <p>Name of the variable which holds all data to be used in the template (variables).</p>                                 | `string` | `false`       | `it` |
| `variables` | <p>Variables to substitute in the template. You can use YAML, JSON or dotenv format. See [examples](#usage-examples)</p> | `string` | `false`       | `""` |

## Outputs

| name | type                                      | description                      |
| --- |-------------------------------------------|----------------------------------|
| `text` | `string` |  <p>Rendered template string</p> |

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
    uses: roamingowl/template-output-with-eta@v1
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
    uses: roamingowl/template-output-with-eta@v1
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
    uses: roamingowl/template-output-with-eta@v1
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
    uses: roamingowl/template-output-with-eta@v1
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
    uses: roamingowl/template-output-with-eta@v1
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
    uses: roamingowl/template-output-with-eta@v1
    id: render
    with:
      template: |
        The difference is <%= Math.abs(utils.dateFns.differenceInMinutes(new Date(it.t1 * 1000), new Date(it.t2 * 1000))) %> minutes
      variables: |
        t1: 1711187861
        t2: 1711188041
  - name: Print difference
    shell: bash
    run: echo "Difference is ${{ steps.render.outputs.text }}"
```

# License
The scripts and documentation in this project are released under the [MIT License](LICENSE)