const frameWork = {
    engine: '1.0.000',
    data: { loading: true, test: { show: true }, devices: [
        { name: 'Hello', type: 'Cam', items: [{ name: "world1" }, { name: "world2" }] },
        { name: 'NoItems', type: 'Cam', items: [] },
    ] },
    lastRender: 0,
    maxLoopItterations: 20,
    loopItterations: 0,

    getDataByPath: function(path){
        let data = this.data;
        if(!path || !data) return undefined;
        let paths = path.split('.');
        for(let path of paths){
            if(data[path]===undefined) return undefined;
            data = data[path];
        }
        return data;
    },

    renderForLoops: function(freshRun=false){
        if(freshRun){
            this.loopItterations = 0;
            for(let item of document.querySelectorAll('[data-each-index]')) item.remove();
            
            for(let el of document.querySelectorAll('[data-for]')){
                el.removeAttribute('data-rendered');
            }
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
            let attributes = ['data-if', 'data-for', 'data-show', 'data-innerHtml'];
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
                if(el.getAttribute('data-rendered')) continue;
                el.setAttribute('data-rendered', true);

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
                    el.style.display = el.getAttribute('data-show') || 'block';
                }else{
                    el.style.display = 'none';
                }
            }
            if(!newLoopFound) break;
            this.loopItterations++;
        }
            
        for(let el of document.querySelectorAll('[data-for]')){
            el.removeAttribute('data-rendered');
        }

        if(this.loopItterations==this.maxLoopItterations){
            console.error('Max loop itterations reached');
        }
    },

    render: function(){
        this.renderForLoops(true);

        for(let el of document.querySelectorAll('[data-if]')){
            let condition = el.getAttribute('data-if');
            let parts = condition.split('=');
            let display = 'none';
            if(parts.length==1){
                if(this.getDataByPath(condition)){
                    display = el.getAttribute('data-show') || 'block';
                }
            }else if(parts.length==2){
                if(this.getDataByPath(parts[0])==parts[1]){
                    display = el.getAttribute('data-show') || 'block';
                }
            }
            el.style.display = display;
        }

        for(let el of document.querySelectorAll('[data-innerHtml]')){
            let condition = el.getAttribute('data-innerHtml');
            let data = this.getDataByPath(condition);
            if(data){
                el.innerHTML = data;
            }else{
                el.innerHTML = el.getAttribute('data-unknown') || '';
            }
        }

        this.lastRender = Date.now();
    },
}

frameWork.render();
