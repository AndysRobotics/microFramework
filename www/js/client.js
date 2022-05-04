const frameWork = {
    engine: '1.0.000',
    data: { loading: true, test: { show: true }, devices: [
        { name: 'Hello', type: 'Cam', items: [{ name: "world1" }, { name: "world2" }] },
        { name: 'NoItems', type: 'Cam2', items: [] },
    ] },
    lastRender: 0,
    maxLoopItterations: 20,
    loopItterations: 0,

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

    showElement(el){
        if(!el || typeof(el.getAttribute)!='function' || !el.style) return;
        el.style.display = el.getAttribute('data-show') || 'block';
    },

    hideElement(el){
        if(!el || typeof(el.getAttribute)!='function' || !el.style) return;
        el.style.display = 'none';
    },

    render: function(){
        this._renderForLoops();
        this._renderSwithes();
        this._renderIfs();
        this._renderInnerHtml();
        this.lastRender = Date.now();
    },

    _renderForLoops: function(){
        let loopProccessedTempAttr = 'data-loop-processed';
        this.loopItterations = 0;
        for(let item of document.querySelectorAll('[data-each-index]')) item.remove();
        
        for(let el of document.querySelectorAll('[data-for]')){
            el.removeAttribute(loopProccessedTempAttr);
        }

        function fixItemCondition(attribute, item, forcondition, index){
            if(!item || typeof(item.getAttribute)!='function' || !forcondition) return;
            let len = forcondition.length;
            let prevAttr = item.getAttribute(attribute);
            if(prevAttr && prevAttr.substring(0, len+1)==forcondition + '.'){
                prevAttr = prevAttr.replace(forcondition + '.', forcondition + '.' + index + '.')
                item.setAttribute(attribute, prevAttr);
            }
        }

        function fixItemConditions(item, forcondition, index){
            if(!item || typeof(item.getAttribute)!='function') return;
            let attributes = ['data-if', 'data-for', 'data-show', 'data-innerHtml', 'data-switch'];
            for(let attribute of attributes){
                fixItemCondition(attribute, item, forcondition, index);
                for(let child of item.querySelectorAll('[' + attribute + ']')){
                    fixItemCondition(attribute, child, forcondition, index);
                }
            }
        }

        while(this.loopItterations<this.maxLoopItterations){
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
            this.loopItterations++;
        }
            
        for(let el of document.querySelectorAll('[data-for]')){
            el.removeAttribute(loopProccessedTempAttr);
        }

        if(this.loopItterations==this.maxLoopItterations){
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
        let self = this;
        function testCondition(condition){
            if(self.getDataByPath(condition)) return true;

            let parts = condition.split('!=');
            if(parts.length==2) return (self.getDataByPath(parts[0])!=parts[1]);

            parts = condition.split('>=');
            if(parts.length==2) return (self.getDataByPath(parts[0])>=parts[1]);

            parts = condition.split('<=');
            if(parts.length==2) return (self.getDataByPath(parts[0])<=parts[1]);

            parts = condition.split('=');
            if(parts.length==2) return (self.getDataByPath(parts[0])==parts[1]);

            parts = condition.split('<');
            if(parts.length==2) return (self.getDataByPath(parts[0])<parts[1]);

            parts = condition.split('>');
            if(parts.length==2) return (self.getDataByPath(parts[0])>parts[1]);

            return false;
        }

        for(let el of document.querySelectorAll('[data-if]')){
            let condition = el.getAttribute('data-if');
            if(testCondition(condition)){
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
            if(data){
                el.innerHTML = data;
            }else{
                el.innerHTML = el.getAttribute('data-unknown') || '';
            }
        }
    },
}

frameWork.render();
