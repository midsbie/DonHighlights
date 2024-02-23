# Don Highlights

Don Highlights is a JavaScript library designed to facilitate the creation, management, and
interaction of text highlights within live web pages. It enables developers to programmatically
highlight text within a specified HTML container element with ease.

This library is an evolution of an earlier project that I previously developed to integrate with a
backend to create machine-inferred highlights using a browser extension as a front-end. This
original repository, now unavailable, was also released under the MIT license.

## Features

- Provides a comprehensive text highlighting solution for web content.
- Supports dynamic highlight groups for organized annotation.
- Enables custom highlight rendering and styling.
- Allows text selection and highlight manipulation via a cursor interface.
- Offers event-driven interactions for highlight creation, modification, and removal.
- Capable of querying and filtering highlights based on custom predicates.
- Implements a unique ID generation for individual highlights.

## Getting Started

This guide will help you set up and use the DonHighlights library in your project. Installation

Start by installing the dependencies with Yarn:

```sh
yarn install
```

### Running Tests

To ensure everything is set up correctly, run the tests:

```sh
yarn run test
```

### Building the Library

Build the library to generate the necessary distribution files:

```sh
yarn run build
```

After building, you can check the `dist/` directory for the output:

```sh
$ ls dist/
don-highlights.js  don-highlights.min.js
```

### Available NPM Scripts

- `upgrade`: Upgrade dependencies to their latest versions interactively.
- `check`: Run a series of checks (Flow, Lint, and Format) to ensure code quality.
- `check:push`: A comprehensive check that includes the checks carried out by the `check` script but
  also cleaning, testing, and building the project.
- `clean`: Remove build artifacts and logs to start fresh.
- `test`: Execute tests using Jest.
- `build`: Compile the source code into a distributable format.
- `watch`: Watch for changes in the source files and rebuild automatically.
- `check`:flow: Run Flow to check for type errors.
- `check:lint`: Lint the source code for stylistic errors.
- `check:fmt`: Check if the code is formatted according to Prettier's standards.
- `fix:fmt`: Automatically format JavaScript, JSON, and Markdown files according to Prettier's
  rules.

## Using the Library

Don Highlights supports creating highlights within a document through three primary methods:

- Exact text matches: highlights are created for exact matches of a specified string within the
  document's text content.
- Regular expression matches: highlights can be created for text that matches a given regular
  expression, allowing for more flexible and dynamic text matching.
- Exact XPath objects: highlights can also be created based on precise locations within the
  document's structure, identified by (pseudo) XPath expressions. This method allows for the
  highlighting of text or elements based on their hierarchical position within the DOM.

### Examples of Creating Highlights

For a practical example of how to utilize the Don Highlights library within your projects, please
refer to the tests located in the `test/` directory. These examples demonstrate various use cases
and provide clear, real-world scenarios for implementing text highlighting functionality.

Below are simplified examples demonstrating how to instantiate `DonHighlights` and create highlights
using the mentioned methods.

1. Highlighting exact text matches

```javascript
import { createHighlighter } from "path/to/don/highlights/lib";

// Instantiate DonHighlights with default options
const highlighter = createHighlighter();

// Create a group for managing related highlights
const group = highlighter.create("textMatchGroup");

// Highlight exact text matches
highlighter.query("specific text", (hit) => group.highlight(hit));
```

2. Using regular expressions to match text

```javascript
import { createHighlighter } from "path/to/don/highlights/lib";

const highlighter = createHighlighter();
const group = highlighter.create("regexMatchGroup");

// Highlight matches of a regular expression
const regex = new RegExp("pattern", "flags");
highlighter.query(regex, (hit) => group.highlight(hit));
```

3. Highlighting based on exact XPath locations

```javascript
import { createHighlighter } from "path/to/don/highlights/lib";

const highlighter = createHighlighter();
const group = highlighter.create("xpathGroup");

// Define an XPath range
const xpathRange = {
  start: { xpath: "/html/body/div/p[1]", offset: 0 },
  end: { xpath: "/html/body/div/p[1]", offset: 10 },
};

// Highlight based on XPath
highlighter.query(xpathRange, (hit) => group.highlight(hit));
```

## API

### `DonHighlights` Class

The `DonHighlights` class is the main interface for creating, managing, and interacting with text
highlights within a specified DOM container.

#### Constructor parameters:

- container: HTMLElement: The DOM element within which highlights will be managed.
- idGenerator: IdGenerator: An instance of IdGenerator for generating unique identifiers for each
  highlight.
- highlightDecorator: HighlightDecorator: An instance of HighlightDecorator used to customize the
  appearance and behavior of highlights.

#### Methods

- `dispose(): void`: Cleans up resources, removing all event listeners and highlights.
- `setContainer(container: HTMLElement): void`: Sets a new container element for the highlight
  management.
- `refresh(normalise: boolean = false): void`: Refreshes the internal representation of the
  document. Optionally normalizes text nodes.
- `normalise(): void`: Normalizes text nodes within the container, preserving the integrity of the
  HEAD element for certain websites.
- `create(name: string): Group`: Creates a new highlight group with the specified name.
- `reset(): void`: Resets all highlight groups, removing all highlights.
- `clear(): void`: Clears all highlights without removing the groups.
- `has(name: string): boolean`: Checks if a group with the specified name exists.
- `group(name: string): Group`: Retrieves the group with the specified name.
- `count(): number`: Returns the total count of highlights across all groups.
- `forEach(predicate: ForEachPredicate): void`: Executes a function for each highlight in all
  groups.
- `some(predicate: SomePredicate): boolean`: Tests whether at least one highlight in any group
  passes the test implemented by the provided function.
- `query(query: QuerySubject, predicate: QueryPredicate): boolean`: Executes a query against the
  document content and applies a predicate function to each hit.

### `Group` Class

Represents a collection of highlights that can be managed together.

#### Methods

- `enable(): void`: Enables all highlights within the group.
- `disable(): void`: Disables all highlights within the group.
- `setEnabled(enabled: boolean): void`: Sets the enabled state of all highlights in the group.
- `get(id: string): Highlight`: Retrieves a highlight by its identifier.
- `has(id: string): boolean`: Checks if a highlight with the specified identifier exists in the
  group.
- `add(hl: Highlight): void`: Adds a highlight to the group.
- `highlight(range: TextRange): Highlight`: Creates a highlight from the specified text range and
  adds it to the group.
- `unhighlight(id: string): void`: Removes a highlight by its identifier.
- `remove(): void`: Removes all highlights from the group and deletes the group.
- `clear(): void`: Clears all highlights from the group without deleting the group.
- `forEach(predicate: ForEachPredicate): void`: Executes a function for each highlight in the group.
- `some(predicate: SomePredicate): boolean`: Tests whether at least one highlight in the group
  passes the test implemented by the provided function.

### `Highlight` Class

Represents a single highlight within a document.

#### Methods

- `setEnabled(enabled: boolean): void`: Sets the enabled state of the highlight.
- `remove(): void`: Removes the highlight from the document.
- `isActive(): boolean`: Checks if the highlight is active and visible in the document.
- `getState(): any`: Returns the state associated with the highlight.
- `setState(state: any): void`: Sets the state associated with the highlight.
- `calculateBounds(): DOMRect`: Calculates the bounding rectangle of the highlight.
- `toJSON(): HighlightJSON`: Serializes the highlight to a JSON object representing its range.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and
create. All contributions are greatly appreciated.

## License

Distributed under the MIT License. See LICENSE for more information.
