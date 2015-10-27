(function($){
    "use strict";
    
    // DT v1.10.8 or greater only
    if($.fn.dataTable.versionCheck('1.10.8')){
        $(document).on('preInit.dt', function(e, settings){
            _fnCreateTableDropDowns(settings);
        });
    }
    
    // DT < v1.10.8
    //this method requires an additional draw for each dropdown created
    else{
        $(document).one('draw.dt', function(e, settings){ 
            _fnCreateTableDropDowns(settings);
        });
    }
    
    /*******
      - Index all columnDefs with > 1 target
      - Store a relevant index for each column to ensure unique 
          id and name properties
    *******/
    function _fnGetColumnIndexes(_cols){
        var _targets = [];
        var _col;
        
        for(var _col_idx in _cols){
            if(_cols.hasOwnProperty(_col_idx)){
                _col = _cols[_col_idx];
                 
                if(typeof(_col.targets) === "undefined" || _col.targets.length <= 1 || typeof(_col.filter) !== 'object'){
                    continue;
                }
                 
                var _target_count = 0;
                 
                for(var _target_idx in _col.targets){
                    if(_col.targets.hasOwnProperty(_target_idx)){ 
                        _targets[_col.targets[_target_idx]] = _target_count++;
                    }
                }
            }
        }
        
        return _targets;
    }
    
    /*******
      - Create a new <label> node
      - Set HTML and CSS as defined by _f
    *******/
    function _fnCreateLabel(_f){
        if(typeof(_f.label) === 'undefined'){
            _f.label = "";   
        }
        
        var $_lbl = $("<label>"+_f.label+"</label>");
        $_lbl.css({
            //display:"inline-block",
            margin:"2px 15px 2px 2px",
            float:"left",
        });
        
        return $_lbl;
    }
    
    /*******
      - Create a new <select> node
      - Add defined properties to node
    *******/
    function _fnCreateSelect(_f,_col_idx,_targets){
        var $_sel = $("<select></select>");
        
        if(typeof(_f.first) !== 'undefined' && _f.first !== false){
            var $_opt = $("<option></option>");
            if(typeof(_f.first.value) !== 'undefined'){
                $_opt.val(_f.first.value === null? 'null' : _f.first.value);
            }
            else{
                $_opt.val('null');
            }
            
            if(typeof(_f.first.title) !== 'undefined'){
                $_opt.html(_f.first.title);   
            }
            else{
                $_opt.html("All");   
            }
            $_opt.appendTo($_sel);
        }
        
        if(_f.id){
            
            //if this column def has >1 target add an index to the ID
            if(typeof(_targets[_col_idx]) !== "undefined"){
                $_sel.prop('id',_f.id + '_' + _targets[_col_idx]);   
            } else {
                $_sel.prop('id',_f.id);
            }
        }
        
        if(_f.name){
            //if this column def has >1 target add an index to the name
            if(typeof(_targets[_col_idx]) !== "undefined"){
                $_sel.prop('name',_f.name + '[' + _targets[_col_idx] + ']');   
            } else {
                $_sel.prop('name',_f.name);
            }
        }
        
        if(_f.class){
            $_sel.addClass(_f.class);   
        }
        
        return $_sel;
    }
    
    /*******
      - Get the id of the DataTable
    *******/
    function _fnGetDtTableId(_settings){
        return _settings.sTableId;
    }
    
    /*******
      - Get a reference to the DataTable object
    *******/
    function _fnGetDtReference(_settings){
        return $('#' + _settings.sTableId).dataTable();    
    }
    
    /*******
      - Get a reference to the DataTable's API object
    *******/
    function _fnGetDtApiReference(_dt){
        return _dt.api();   
    }
    
    /*******
      - Parse DataTables columns
      - If filter option is defined for given column, create the dropdown
          and attach it to the table with appropriate listener for changes
    *******/
    function _fnCreateTableDropDowns(settings){
        
         var cols = settings.aoColumns;
             
         if(cols.length > 0){
             
             var targets = _fnGetColumnIndexes(cols);
             
             for(var col_idx in cols){
                if(cols.hasOwnProperty(col_idx)){
                  
                     var col = cols[col_idx];
                     
                     if(typeof(col.filter) === 'object'){
                         
                        var f = col.filter;
                        
                        if(typeof(f.source) === "undefined" || !f.source){
                            console.log("DT error: missing filter data source for column "+col_idx);
                            continue;
                        }

                        var $_lbl = _fnCreateLabel(f); 
                        var $_sel = _fnCreateSelect(f,col_idx,targets);

                        $_sel = _fnParseSourceData(f,$_sel);
                        
                        $_sel = _fnAttachSelectToTable(settings,f,$_lbl,$_sel);                    
                        
                        $_sel = _fnSetOnFilterChange(settings,col_idx,$_sel);
                     }
                 }
             }
         }
    }
    
    /*******
      - Find appropriate target to append/prepend <label> and <select> to
      - Attach to target and return the <select>
    *******/
    function _fnAttachSelectToTable(_settings,_f,_lbl,_sel){
        
        //Might want to move this to a global scope for easy modifiying if necessary
        var _dom_elements = {l: '_length', f: '_filter', t: '', i: '_info', p: '_paginate', r: '_processing', w: '_wrapper'};
        
        //define a fallback target in case none is defined
        // using the first character in the dom string
        var _filtered_sdom = fnFilterSDom(_settings.sDom);
        
        var _tbl_id = _fnGetDtTableId(_settings);
        
        var _target = '#' + _tbl_id + _dom_elements[_filtered_sdom.charAt(0)];
        
        // after: append node to the given position
        // before: prepend node to given position
        if(typeof(_f.after) !== 'undefined' || typeof(_f.before) !== 'undefined'){
        
            var _specified_target = typeof(_f.after) !== 'undefined'? _f.after : _f.before;
            var _found_target = true;
            
            if(_specified_target.indexOf('#') === 0){
                _target = _specified_target;
            }
            else if(_specified_target && _dom_elements[_specified_target]){
                _target = '#' + _tbl_id + _dom_elements[_specified_target];                        
            }
            else{
                console.log("DT Error: specified DOM target not found: "+_specified_target+"\ndefaulting to first DOM element of table");
                _found_target = false;    
            }
            
            
            if($(_target).length <= 0){
                console.log("DT Error: unable to find specified target to append dropdown to (selector: "+_target+")");
                _target = '#' + _tbl_id + '_filter';
                _found_target = false;
            }
            
            
            _sel.appendTo(_lbl);
            
            if(typeof(_f.after) !== 'undefined' || !_found_target){
                _lbl.appendTo(_target);
            } 
            else{
                _lbl.prependTo(_target);
            }
            
            return _sel;
        }
        
        
        // no placement position defined - default to ?
        else{
            $_lbl.appendTo(_target);    
        }
    }
    
    /*******
      - Extract relevant characters from the DataTable's sDom string
      - Removes any class or node declarations and returns relevant string of 
          dom letters (lftipr)
    *******/
    function fnFilterSDom(sdom_str){
        var _filtered_sdom = "";
        var _sdom_regex = /["#]\b[a-z]+["]\b([a-z]+)|>([a-z]+)<|^(\w+)$|>([a-z]+)/gi;
        var _cg_count = 4;//# of capturing groups to check
        var matches;
        do{
            matches = _sdom_regex.exec(sdom_str); 
            if(matches){
                for(var i = 1; i <= _cg_count; i++){
                    if(matches[i]){
                        _filtered_sdom += matches[i];   
                    }
                }
            }
        } while (matches);
        
        return _filtered_sdom;
    }
    
    /*******
      - Create <option> nodes from given _data
      - Append <option> nodes to given <select> (_sel)
    *******/
    function _fnAppendSelData(_data,_sel){
        for(var s_idx in _data){
            if(_data.hasOwnProperty(s_idx)){
                var _src_data = _data[s_idx];
                
                var $_opt = $("<option></option>");
                
                if(typeof(_src_data) === typeof({})){
                    
                    if(typeof(_src_data.value) === "undefined"){
                        console.log("DT Error: invalid source data - missing value");
                        continue;   
                    }
                    
                    $_opt.val(_src_data.value);
                    
                    //Use value as name if not specified
                    if(typeof(_src_data.title) === "undefined"){
                        $_opt.html(_src_data.value);
                    } else {
                        $_opt.html(_src_data.title);
                    }   
                    
                } 
                else {
                    $_opt.val(s_idx).html(_src_data);
                }
                
                _sel.append($_opt);
            }
        }   
        return _sel; 
    }
    
    /*******
      - Parse source data from filter (_f) data
      - Add source data to <select> (_sel)
    *******/
    function _fnParseSourceData(_f,_sel){
     
        if(typeof(_f.source) === 'function'){
            _sel = _fnAppendSelData(_f.source(),_sel);   
        } 
        
        //assuming string is ajax url
        else if (typeof(_f.source) === 'string'){
            $.ajax({
                url: _f.source,
                dataType:"JSON",
                error: function(){
                    console.log("DT Error: error retrieving filter data via AJAX from URL:"+_f.source);    
                },
                success:function(resp){
                    
                    _sel = _fnAppendSelData(resp,_sel);   
                }
            });
        }
        
        //Have source data - can populate <select> immediately and attach to html
        else if(Object.prototype.toString.call(_f.source) === '[object Array]'){
            _sel = _fnAppendSelData(_f.source,_sel);
        }
        
        //assuming object which defines ajax cb
        else if (typeof(_f.source) === 'object'){
            
            //treat as AJAX definition
            if(typeof(_f.source.url) !== 'undefined' && _f.source.url){
                var _ajax = _f.source;
                var _cb = typeof(_f.source.success === 'function')? _f.source.success : null;
                
                _ajax.error = function(){
                    console.log("DT Error: error retrieving filter data via AJAX from URL:"+_f.source);    
                };
                _ajax.success = function(resp){
                    _sel = _fnAppendSelData(resp,_sel);
                    if(typeof(_cb) === 'function'){
                        _cb(resp);
                    }
                };
                
                $.ajax(_ajax);
            }
            else{
                _sel = _fnAppendSelData(_f.source,_sel);
            }
        }
        
        return _sel;
    }
    
    /*******
      - Set onchange listener for the <select> (_sel)
      - Call DataTable's search() function on the appropriate column (_col) 
          upon changing _sel value
      - Call search() initially to update DataTable column's current value to match 
          _sel's initial value
    *******/
    function _fnSetOnFilterChange(_settings,_col_idx,_sel){
        var _api = _fnGetDtApiReference(_fnGetDtReference(_settings));
        var _col = _api.column(_col_idx);
        
        _sel.on('change',function(){
            var val = $.fn.dataTable.util.escapeRegex($(this).val());
            _col.search(val? val : '', true, false).draw();
        });
        
        if($.fn.dataTable.versionCheck('1.10.8')){
            var val = $('option',_sel).eq(0).val();
            _col.search(val? val : '', true, false);
        }
        else{
            setTimeout(function(){
                _sel.change();
            },5);
        }
        
        return _sel;
    }
    
})(jQuery);