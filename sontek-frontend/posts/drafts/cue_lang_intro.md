---
category: DevOps
date: 2022-04-03
tags:
    - CUE
title: Introduction to CUE Lang
---
> inheritance is questionable in programming, its fatal in configuration
> code does not provide a contract between developer intent and runtime operation
> can think of it like a spreadsheet where you can reference other cells and run functions but for JSON.

- Show eval cmd
- Show export cmd
- Show vet cmd

- Showing nesting and generating multiple files
    - https://www.youtube.com/watch?v=OaPLbvHpVlc

- Show interpolation of other variables like:
    - "\(p), \(q)" 
- Show errors when it doesn't have all concrete values
- Show math a + b
- Show generating OpenAPI specs?
- Show combining JSON and YAML
- Show wildcard on key select `[=~"Name$" ]`
- Show regex validation: `^[A-Z]`
- Show constraints like `foo: >=4 & <=12`
- Show optional field like `bar?: int`
- Show trim **:chefs_kiss:**
    - 

- Compare to JSON Schema
    - Can generate JSON Schema from CUE
    - Can generate CUE from a JSON Schema
- Show how to validates kubernetes manifests
    - maybe require prometheus scraping turned on?
    - initialDelaySeconds > 15?
    - standardize liveness path?

- Syntax:
    - * is default value
    - `import` / `module` / `package`

- What is CUE?
    - Configuration
    - Validation
    - Logic Programming Engine
    - Strongly Typed
    - Treats values and types the same
    - Idempotent (order doesn't matter!!)
    - No overrides / overlays -- 1 layer
    - No mixing code with configuration
    - Requires everything gets more specific


Data:
    ```cue
    foo: {
        name: "Bar"
        cash: 1.2M
        age: 36
    }
    ```

Type:
    ```cue
    foo: {
        name: string
        cash: int & > 1M
        age: > 30
    }


# Resources
- https://www.youtube.com/watch?v=e4v1_2bSeGI
- https://www.youtube.com/watch?v=fR_yApIf6jU
