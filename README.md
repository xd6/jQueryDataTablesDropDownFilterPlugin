# jQueryDataTablesDropDownFilterPlugin
A simple way to create dropdown filters for DataTables' columns

##Usage
This plugin allows you to add an additional options to **colDefs** when initializing your DataTable. These options should all fall into a single object given the key **filter**.

##Requirements
  - jQuery
  - DataTables v1.10 or greater (v1.10.8 or greater highly recommended for performance reasons)

####Example:
```
var dt = $('#table').dataTable({ 
    //... other DataTable options
    columnDefs:[
        {
            targets:[0],
            filter: {
                name: "Column0DropDown",
				label: "Column0Label",
				id: "column0_drpdwn",
				after: 'f',
				first: {value: null, title: "Show all"},
				source: {"Value0": "Title0", "Value1": "Title1", "Value2": "Title2"}
            }
        },
        {
            targets:[1],
            filter: {
                name: "Column1DropDown",
				label: "Column1Label",
				class: "column-drpdwn",
				id: "column1_drpdwn",
				before: '#table-filter-wrapper',
				first: {value: null, title: "Show all"},
				source: {
					url: "/path/to/json/data",
					type: "POST",
					dataType: "JSON",
					success:function(response){
						console.log("Dropdown created - data:",response);
					}
				}
            }
        },
    ],
});
```

##Options
- source
  - array/object, AJAX object, anonymous function or string
  - the data used to generate the <option> node's within the dropdown
  - if an array or object with key=>value pairs is given, the array data will be used, assuming each array key => value pair as the value and title, respectively, for each <option>
    - you may also use an object with **value** and **title** keys to define each <option>'s properties which will be used instead of inferring directly from the array/object's key/value pairs
  - if an object containing AJAX parameters is given, it will be called as the argument to jQuery's .ajax() function, and should define any appropriate AJAX options
    - a JSON string is expected as the return to the AJAX function, which will be turned into <option> nodes with JSON key => value pairs turned into <option value="{key}">{value}</option>
    - you may specify a callback function as the success option to the AJAX object, which will be called after the <option> nodes have been created
  - if a string is given, it is assumed to be an AJAX URL which returns JSON data that will be turned into <option> nodes

  - examples:
  ```
    // Using a regular key=>value array for the data source \\
    
    var dt = $('#table').dataTable({ 
        //... other DataTable options
        columnDefs:[
            {
                targets:[0],
                filter: {
                    name: 'Column0DropDown',
                    label: 'Column0',
                    source: ['Option0Title', 'Option1Title', 'Option2Title'],
                    //...
                }
            },
        ],
    });
    
    //Creates:
    <label>Column0
        <select name="Column0DropDown">
            <option value="0">Option0Title</option>
            <option value="1">Option1Title</option>
            <option value="2">Option2Title</option>
        </select>
    </label>
    
	///////////////////////////////////
	
    // Using a single object for the data source \\
    
    var dt = $('#table').dataTable({ 
        //... other DataTable options
        columnDefs:[
            {
                targets:[0],
                filter: {
                    name: 'Column0DropDown',
                    label: 'Column0',
                    source: {'Option0Value':'Option0Title', 'Option1Value':'Option1Title, 'Option2Value':'Option2Title'},
                    //...
                }
            },
        ],
    });
    
    //Creates:
    <label>Column0
        <select name="Column0DropDown">
            <option value="Option0Value">Option0Title</option>
            <option value="Option1Value">Option1Title</option>
            <option value="Option2Value">Option2Title</option>
        </select>
    </label>
    
	///////////////////////////////////
	
    // Using an array of objects for the data source \\
    
    var dt = $('#table').dataTable({ 
        //... other DataTable options
        columnDefs:[
            {
                targets:[0],
                filter: {
                    name: 'Column0DropDown',
                    label: 'Column0',
                    source: [{value:'Option0Value',title:'Option0Title'}, {value:'Option1Value',title:'Option1Title}, {value:'Option2Value',title:'Option2Title'}],
                    //...
                }
            },
        ],
    });
    
    //Creates:
    <label>Column0
        <select name="Column0DropDown">
            <option value="Option0Value">Option0Title</option>
            <option value="Option1Value">Option1Title</option>
            <option value="Option2Value">Option2Title</option>
        </select>
    </label>
    
	///////////////////////////////////
	
    // Using an AJAX URL for the data source which returns JSON \\
    
    var dt = $('#table').dataTable({ 
        //... other DataTable options
        columnDefs:[
            {
                targets:[0],
                filter: {
                    name: 'Column0DropDown',
                    label: 'Column0',
                    source: "/path/to/json/data",
                    //...
                }
            },
        ],
    });
    
    //Creates:
    <label>Column0
        <select name="Column0DropDown">
            <option value="Option0JsonValue">Option0JsonTitle</option>
            <option value="Option1JsonValue">Option1JsonTitle</option>
            <option value="Option2JsonValue">Option2JsonTitle</option>
        </select>
    </label>
    
	///////////////////////////////////
	///////////////////////////////////
	
    // Using an AJAX object for the data source which returns JSON \\
    
    var dt = $('#table').dataTable({ 
        //... other DataTable options
        columnDefs:[
            {
                targets:[0],
                filter: {
                    name: 'Column0DropDown',
                    label: 'Column0',
                    source: {
						url: "/path/to/json/data",
						type: "POST",
						dataType: "JSON",
						success(response){
							//.. anything defined in here will be called after the <option> nodes are created
						}
					},
                    //...
                }
            },
        ],
    });
    
    //Creates:
    <label>Column0
        <select name="Column0DropDown">
            <option value="Option0JsonValue">Option0JsonTitle</option>
            <option value="Option1JsonValue">Option1JsonTitle</option>
            <option value="Option2JsonValue">Option2JsonTitle</option>
        </select>
    </label>
    
	///////////////////////////////////
  ```
  
- name
  - string
  - this will be the value given to the generated <select> node's **name** property
  - if this option is within a columnDef containing > 1 target, the name will be turned into an array so they none are overwritten

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
  
 