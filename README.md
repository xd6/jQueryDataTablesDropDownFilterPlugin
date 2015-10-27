# jQueryDataTablesDropDownFilterPlugin
A simple way to create dropdown filters for DataTables' columns

##Usage
This plugin allows you to add an additional options to **colDefs** when initializing your DataTable. These options should all fall into a single object given the key **filter**.

Example:
```
var dt = $('#table').dataTable({ 
    //... other DataTable options
    columnDefs:[
        {
            targets:[0],
            filter: {
                //... dropdown filter settings for column 0
            }
        },
        {
            targets:[1],
            filter: {
                //... dropdown settings for column 1
            }
        },
    ],
});
```

##Options
- source
  - array, AJAX object or string
  - the data used to generate the <option> node's within the dropdown
  - if an array is given, the array data will be used, assuming each array key => value pair as the value and title, respectively, for each <option>
  - if an object is given, it will be called as the argument to jQuery's .ajax() function, and should define any appropriate AJAX options
    - a JSON string is expected as the return to the AJAX function, which will be turned into <option> nodes with JSON key => value pairs turned into <option value="{key}">{value}</option>
    - you may specify a callback function as the success option to the AJAX object, which will be called after the <option> nodes have been created
  - if a string is given, it is assumed to be an AJAX URL which returns JSON data that will be turned into <option> nodes

  -examples:
  ```
    // Using an array for the data source \\
    
    var dt = $('#table').dataTable({ 
        //... other DataTable options
        columnDefs:[
            {
                targets:[0],
                filter: {
                    name: 'Column0DropDown',
                    label: 'Column0',
                    source: ['Option0Value','Option1Value','Option2Value'],
                    //...
                }
            },
        ],
    });
    
    //Creates:
    <label>Column0
        <select name="Column0DropDown">
            <option value="0">Option0Value</option>
            <option value="1">Option1Value</option>
            <option value="2">Option2Value</option>
        </select>
    </label>
    
  ```
  
- name
  - string
  - this will be the value given to the generated <select> node's **name** property

- label
  - string
  - if given, a <label> node will be wrapped around the <select> node along with this string

- id
  - string
  - if given, this will determine the <select> node's id property
  - if there are more than 1 target and this option is present, an index will be appended to each node's id property to make them distinct
- class  
  - string
  - if given, this string will be added to the <select> node's class property
  
- after/before
  - string
  - specify either a node by ID, including # in front of it (ex: '#div_1')
  - or specify one of the DataTable's dom character (typically **l** **f** **r** **t** **i** or **p** - see *https://datatables.net/reference/option/dom*)
  - option name will determine whether dropdown in appended (*before*) or prepended (*after*) to given node

- first
  - object ({value: "option value", title: "option title"}) or string
  - if this option is set, the first <option> node in the dropdown will be created based on the value given to it. 
  - if an object is given, it expects **value** and **title** keys to describe the <option> node that will be created
  - if a string is given, it will be used for both the **value** and **title** functionality of the <option> node
  
 