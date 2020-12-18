# Nabbous Angular Bootstrap Components
This package provides a variaty of useful components that is based on bootstrap.

### Available components
- **`<image-input>`** which is a component that provides an image input that supports drag and drop and provides an _`ImageInputValue`_
- **`<image-gallery>`** which is a component that provides gallery image input that uses `<image-input>` provides an array of _`GalleryImageValue`_ which extends _`ImageInputValue`_

### Available directives
- **`[popover]`** is a directive that adds popover on the component used on that is fully customizable and supports rtl, you can pass content as `string` or `ng-template-ref`, and also assign the `[popoverPlacement]`

### Installation

##### Bootstrap
First things first we need to install bootstrap styles in angular.
run this command:
`npm i bootstrap-rtlized`

Then in styles.scss
    
    ...
    import '~bootstrap-rtlized';
    ...

##### Package

run this command:
`npm i @monabbous/ng-bootstrap-components`

and then import in your module 


    ...
    imports : [
        ...
        NabbousBootstrapComponentsModule,
        ...
    ],
    ...
    
    
### Usage
comming soon
