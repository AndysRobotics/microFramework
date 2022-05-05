const mfw = {
    engine: '1.0.000',
    data: {},
    lastRender: 0,
    maxLoopItterations: 20,
    bindableAttributes: [
        'data-if', 'data-for', 'data-innerHtml',
        'data-switch', 'data-value', 'data-param',
        'data-src', 'data-class', 'data-class-if',
    ],

    getDataByPath: function(path=''){
        let data = this.data;
        if(!path || !data) return undefined;
        let paths = path.split('.');
        for(let path of paths){
            if(data[path]===undefined) return undefined;
            data = data[path];
        }
        return data;
    },

    setDataByPath: function(path='', value){
        if(!path || typeof(path)!='string') return;
        let paths = path.split('.');
        if(!paths.length) return;
        let data = this.data;
        if(paths.length==1){
            data[paths[0]] = value;
        }else{
            for(let i=0; i<(paths.length-1); i++){
                let key = paths[i];
                if(typeof(data[key])!='object') data[key]={};
                data = data[key];
            }
            let key = paths[paths.length-1];
            data[key] = value;
        }
    },

    getDataFromInputGroup(groupName){
        if(!groupName || typeof(groupName)!='string') return {};
        let result = {};
        for(let input of document.querySelectorAll('[data-group]')){
            let key = input.name;
            if(key){
                if(input.type=="checkbox") result[key] = !!input.checked;
                else result[key] = input.value;
            }
        }
        return result;
    },

    getDataFromElement(el){
        if(!el || typeof(el.getAttribute)!='function' || !el.style) return { index: null, param: null};
        let path = el.getAttribute('data-param');
        return {
            index: el.getAttribute('data-each-index'),
            param: this.getDataByPath(path),
        }
    },

    showElement(el){
        if(!el || typeof(el.getAttribute)!='function' || !el.style) return;
        el.style.display = el.getAttribute('data-show') || 'block';
    },

    hideElement(el){
        if(!el || typeof(el.getAttribute)!='function' || !el.style) return;
        el.style.display = 'none';
    },

    init: function(){
        this.render();
        document.addEventListener('input', (event)=>{
            this._handleDocumentInteraction(event);
        });
    },

    render: function(){
        this._renderForLoops();
        this._renderSwithes();
        this._renderClassNames();
        this._renderIfs();
        this._renderInnerHtml();
        this._renderImageSrcs();
        this._renderInputValues();
        this.lastRender = Date.now();
    },

    _handleDocumentInteraction: function(event){
        if(!event || !event.target || typeof(event.target.getAttribute)!='function') return;
        if(event.target.tagName!='INPUT' && event.target.tagName!='TEXTAREA') return;
        if(!event.target.getAttribute('data-value')) return;
        let path = event.target.getAttribute('data-value');
        if(!path) return;
        let newValue = event.target.value;
        if(event.target.type=='checkbox') newValue = !!event.target.checked;
        let oldValue = this.getDataByPath(path)
        if(oldValue===newValue) return;
        this.setDataByPath(path, newValue);
        this.render();
    },

    _testCondition: function(condition){
        if(!condition || typeof(condition)!='string') return false;
        if(this.getDataByPath(condition)) return true;
        if(condition.charAt(0)=='!'){
            if(!this.getDataByPath(condition.substring(1))) return true;
        }

        let parts = condition.split('!=');
        if(parts.length==2) return (this.getDataByPath(parts[0])!=parts[1]);

        parts = condition.split('>=');
        if(parts.length==2) return (this.getDataByPath(parts[0])>=parts[1]);

        parts = condition.split('<=');
        if(parts.length==2) return (this.getDataByPath(parts[0])<=parts[1]);

        parts = condition.split('=');
        if(parts.length==2) return (this.getDataByPath(parts[0])==parts[1]);

        parts = condition.split('<');
        if(parts.length==2) return (this.getDataByPath(parts[0])<parts[1]);

        parts = condition.split('>');
        if(parts.length==2) return (this.getDataByPath(parts[0])>parts[1]);

        return false;
    },

    _renderForLoops: function(){
        let self = this;
        let loopProccessedTempAttr = 'data-loop-processed';
        for(let item of document.querySelectorAll('[data-each-index]')) item.remove();
        
        for(let el of document.querySelectorAll('[data-for]')){
            el.removeAttribute(loopProccessedTempAttr);
        }

        function fixItemCondition(attribute, item, forCondition, index){
            if(!item || typeof(item.getAttribute)!='function' || !forCondition) return;
            let len = forCondition.length;
            let prevAttr = item.getAttribute(attribute);
            if(prevAttr==forCondition){
                item.setAttribute(attribute, prevAttr + '.' + index);
            }else if(prevAttr && prevAttr.substring(0, len+1)==forCondition + '.'){
                prevAttr = prevAttr.replace(forCondition + '.', forCondition + '.' + index + '.')
                item.setAttribute(attribute, prevAttr);
            }
        }

        function fixItemConditions(item, forcondition, index){
            if(!item || typeof(item.getAttribute)!='function') return;
            for(let attribute of self.bindableAttributes){
                fixItemCondition(attribute, item, forcondition, index);
                for(let child of item.querySelectorAll(':scope [' + attribute + ']')){
                    fixItemCondition(attribute, child, forcondition, index);
                }
            }
        }

        let loopItterations=0;
        while(loopItterations<this.maxLoopItterations){
            let newLoopFound = false;

            for(let el of document.querySelectorAll('[data-for]')){
                let condition = el.getAttribute('data-for');
                let templateElements = el.querySelectorAll(':scope [data-each]');
                if(el.getAttribute(loopProccessedTempAttr)) continue;
                el.setAttribute(loopProccessedTempAttr, true);

                newLoopFound = true;
                let dataList = this.getDataByPath(condition);
                if(templateElements.length && dataList && dataList.length){
                    for(let i=0; i<dataList.length; i++){
                        let template = templateElements[0].cloneNode(true);
                        template.setAttribute('data-each-index', i);
                        template.removeAttribute('data-each');
                        fixItemConditions(template, condition, i);
                        el.appendChild(template);
                    }
                    this.showElement(el);
                }else{
                    this.hideElement(el);
                }
            }
            if(!newLoopFound) break;
            loopItterations++;
        }
            
        for(let el of document.querySelectorAll('[data-for]')){
            el.removeAttribute(loopProccessedTempAttr);
        }

        if(loopItterations==this.maxLoopItterations){
            console.error('Max loop itterations reached');
        }
    },

    _renderSwithes: function(){
        for(let swEl of document.querySelectorAll('[data-switch]')){
            let condition = swEl.getAttribute('data-switch');
            let value = this.getDataByPath(condition);
            if(typeof(value)!='string'){
                this.hideElement(swEl);
            }else{
                let caseFound = false;
                for(let c of swEl.querySelectorAll(':scope [data-case]')){
                    let caseCondition = c.getAttribute('data-case');
                    if(caseCondition==value){
                        caseFound = true;
                        this.showElement(c);
                    }else{
                        this.hideElement(c);
                    }
                }
                let defCases = swEl.querySelectorAll(':scope [data-default]');
                if(defCases.length){
                    if(caseFound){
                        this.hideElement(defCases[0]);
                    }else{
                        caseFound = true;
                        this.showElement(defCases[0]);
                    }
                }
                if(caseFound){
                    this.showElement(swEl);
                }else{
                    this.hideElement(swEl);
                }
            }
        }
    },

    _renderIfs: function(){
        for(let el of document.querySelectorAll('[data-if]')){
            let condition = el.getAttribute('data-if');
            if(this._testCondition(condition)){
                this.showElement(el);
            }else{
                this.hideElement(el);
            }
        }
    },

    _renderInnerHtml: function(){
        for(let el of document.querySelectorAll('[data-innerHtml]')){
            let condition = el.getAttribute('data-innerHtml');
            let data = this.getDataByPath(condition);
            if(data || data===0 || data===false){
                el.innerHTML = data;
            }else{
                el.innerHTML = el.getAttribute('data-unknown') || '';
            }
        }
    },

    _renderImageSrcs: function(){
        for(let el of document.querySelectorAll('[data-src]')){
            let path = el.getAttribute('data-src');
            let data = this.getDataByPath(path);
            if(data){
                this.showElement(el);
                el.src = data;
            }else{
                this.hideElement(el);
                el.src = '';
            }
        }
    },

    _renderClassNames: function(){
        for(let el of document.querySelectorAll('[data-class]')){
            let path = el.getAttribute('data-class');
            el.className = this.getDataByPath(path) || '';
        }

        for(let el of document.querySelectorAll('[data-class-if]')){
            let condition = el.getAttribute('data-class-if');
            if(!condition || typeof(condition)!='string') continue;
            let parts = condition.split(';');
            if(parts.length!=2) continue;
            condition = parts[0];
            let className = parts[1];
            el.classList.remove(className);
            if(this._testCondition(condition)){
                el.classList.add(className);
            }
        }
    },

    _renderInputValues: function(){
        for(let el of document.querySelectorAll('[data-value]')){
            let path = el.getAttribute('data-value');
            if(el.type=="checkbox"){
                if(this.getDataByPath(path)) el.setAttribute('checked', '');
                else el.removeAttribute('checked');
            }else{
                el.value = this.getDataByPath(path) || '';
            }
        }
    },
}
