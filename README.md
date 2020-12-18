# Angular Bootstrap 
This package provides a variaty of useful components and tools that is based on bootstrap.

### Available components
- **`<image-input>`** which is a component that provides an image input that supports drag and drop and provides an _`ImageInputValue`_
- **`<image-gallery>`** which is a component that provides gallery image input that uses `<image-input>` provides an array of _`GalleryImageValue`_ which extends _`ImageInputValue`_
- **`<advanced-select>`**

### Available directives
- **`[popover]`** is a directive that adds popover on the component used on that is fully customizable and supports rtl, you can pass content as `string` or `ng-template-ref`, and also assign the `[popoverPlacement]`
- **`<input advanceInput>`**
- **`<div *loading="boolean">`**

### Installation

##### Bootstrap
First things first we need to install bootstrap styles in angular.
run this command:
`npm i bootstrap-rtlized`

Then in styles.scss
    
    ...
    import '~bootstrap-rtlized';
    ...
    
    
##### Fontawesome
Some components and tools needs [Font Awesome](fontaweome.com) to be installed.


##### Package

run this command:
`npm i @monabbous/ng-bootstrap`

and then import in your module 


    ...
    imports : [
        ...
        NabbousBootstrapComponentsModule,
        ...
    ],
    ...
    
    
### Usage
coming soon
