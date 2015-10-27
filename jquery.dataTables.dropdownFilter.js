(function($){
    "use strict";
    
    // DT v1.10.8 or greater only
    if($.fn.dataTable.versionCheck('1.10.8')){
        $(document).on('preInit.dt', function(e, settings){
            fnCreateTableDropDowns(settings);
        });
    }
    
    // DT < v1.10.8
    //this method requires an additional draw for each dropdown created
    else{
        $(document).one('draw.dt', function(e, settings){ 
            fnCreateTableDropDowns(settings);
        });
    }
    
    
    
    function fnCreateTableDropDowns(settings){
        
         var cols = settings.aoColumns;
             
         if(cols.length > 0){
             
             var _tbl_id = settings.sTableId;
             var _dt = $('#'+_tbl_id).dataTable();
             var _api = _dt.api();
             
             //For multi-target column def's
             // - generate an ID index to ensure unique ID's
             var _targets = [];
             
             var col;
             
             for(var col_idx in cols){
                 if(cols.hasOwnProperty(col_idx)){
                     col = cols[col_idx];
                     
                     if(typeof(col.targets) === "undefined" || col.targets.length <= 1 || typeof(col.filter) !== typeof({})){
                        continue;
                     }
                     
                     var _target_count = 0;
                     
                     for(var target_idx in col.targets){
                         if(col.targets.hasOwnProperty(target_idx)){ 
                            _targets[col.targets[target_idx]] = _target_count++;
                         }
                     }
                 }
             }
             
             for(col_idx in cols){
                if(cols.hasOwnProperty(col_idx)){
                  
                     col = cols[col_idx];
                     
                     if(typeof(col.filter) === 'object'){
                         
                        var f = col.filter;
                        
                        if(typeof(f.source) === "undefined" || !f.source){
                            console.log("DT error: missing filter data source for column "+col_idx);
                            continue;
                        }
                        
                        
                    /**
                        Init. the <select>
                    **/
                        
                        if(typeof(f.label) === 'undefined'){
                            f.label = "";   
                        }
                        
                        var $_lbl = $("<label>"+f.label+"</label>");
                        $_lbl.css({
                            //display:"inline-block",
                            margin:"2px 15px 2px 2px",
                            float:"left",
                        });
                        var $_sel = $("<select></select>");
                        
                        if(typeof(f.first) !== 'undefined' && f.first !== false){
                            var $_opt = $("<option></option>");
                            if(typeof(f.first.value) !== 'undefined'){
                                $_opt.val(f.first.value === null? 'null' : f.first.value);
                            }
                            else{
                                $_opt.val('null');
                            }
                            
                            if(typeof(f.first.title) !== 'undefined'){
                                $_opt.html(f.first.title);   
                            }
                            else{
                                $_opt.html("All");   
                            }
                            $_opt.appendTo($_sel);
                        }
                        
                        if(f.id){
                            
                            //if this column def has >1 target add an index to the ID
                            if(typeof(_targets[col_idx]) !== "undefined"){
                                $_sel.prop('id',f.id + '_' + _targets[col_idx]);   
                            } else {
                                $_sel.prop('id',f.id);
                            }
                        }
                        
                        if(f.name){
                            //if this column def has >1 target add an index to the name
                            if(typeof(_targets[col_idx]) !== "undefined"){
                                $_sel.prop('name',f.name + '[' + _targets[col_idx] + ']');   
                            } else {
                                $_sel.prop('name',f.name);
                            }
                        }
                        
                        if(f.class){
                            $_sel.addClass(f.class);   
                        }
                        
                        
                    /**
                        Create <option>'s from source data
                    **/
                        $_sel = fnParseSourceData(f,$_sel);
                        
                    /**
                        Attach <select> to table
                    **/
                        
                        $_sel.appendTo($_lbl);
                        
                        var _dom_elements = { l: '_length', f: '_filter', t: '', i: '_info', p: '_paginate', r: '_processing', w: '_wrapper'};
                        
                        //define a fallback target in case none is defined
                        // using the first character in the dom string
                        var _filtered_sdom = fnFilterSDom(settings.sDom);
                        
                        
                        var _target = '#' + _tbl_id + _dom_elements[_filtered_sdom.charAt(0)];
                        
                        // after: append node to the given position
                        // before: prepend node to given position
                        if(typeof(f.after) !== 'undefined' || typeof(f.before) !== 'undefined'){
                        
                            var _specified_target = typeof(f.after) !== 'undefined'? f.after : f.before;
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
                            
                            if(typeof(f.after) !== 'undefined' || !_found_target){
                                $_lbl.appendTo(_target);
                            } 
                            else{
                                $_lbl.prependTo(_target);
                            }
                        }
                        
                        
                        // no placement position defined - default to ?
                        else{
                            $_lbl.appendTo(_target);    
                        }
                        
                        //set the dropdown to listen to changes and call the built-in search
                        $_sel = fnSetOnFilterChange(_api.column(col_idx),$_sel);
                     }
                 }
             }
         }
    }
    
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
    
    function fnAppendSelData(_data,_sel){
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
    
    function fnParseSourceData(_f,_sel){
     
        if(typeof(_f.source) === 'function'){
            _sel = fnAppendSelData(_f.source(),_sel);   
        } 
        
        //assuming string is ajax url
        else if (typeof(_f.source) === 'string'){
            $.ajax({
                url: _f.source,
                dataType:"JSON",
                error: function(){
                    console.log("[s]DT Error: error retrieving filter data via AJAX from URL:"+_f.source);    
                },
                success:function(resp){
                    
                    _sel = fnAppendSelData(resp,_sel);   
                }
            });
        }
        
        //Have source data - can populate <select> immediately and attach to html
        else if(Object.prototype.toString.call(_f.source) === '[object Array]'){
            
            _sel = fnAppendSelData(_f.source,_sel);
        }
        
        //assuming object which defines ajax cb
        else if (typeof(_f.source) === 'object'){
            
            var _ajax = _f.source;
            var _cb = typeof(_f.source.success === 'function')? _f.source.success : null;
            
            _ajax.error = function(){
                console.log("[o]DT Error: error retrieving filter data via AJAX from URL:"+_f.source);    
            };
            _ajax.success = function(resp){
                _sel = fnAppendSelData(resp,_sel);
                if(typeof(_cb) === 'function'){
                    _cb(resp);
                }
            };
            
            $.ajax(_ajax);
        }
        
        return _sel;
    }
    
    function fnSetOnFilterChange(_col,_sel){
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