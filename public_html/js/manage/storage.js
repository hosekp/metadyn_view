/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(window.manage===undefined){var manage={};}
if(manage.storage===undefined){manage.storage={};}
$.extend(manage.storage,{
    heap:null,
    nstore:40,
    init:function(){
        var i;
        delete this.heap;
        this.heap=[];
        for(i=0;i<this.nstore;i+=1){
            this.heap.push(null);
        }
    },
    reset:function(){
        this.init();
    },
    save:function(space){
        var ind;
        if(!this.heap){this.init();}
        ind=this.toind(space.ratio);
        if(this.heap[ind]===null){
            this.heap[ind]=space.copy();
        }
        //this.fullness();
    },
    load:function(space,ratio){
        var ind,low,i,src;
        if(!this.heap){this.init();}
        ind=this.toind(ratio);
        low=this.toind(space.ratio);
        for(i=ind;i>low;i-=1){
            if(this.heap[i]){
                src=this.heap[i];
                if(src.ratio>ratio){continue;}
                if(src.ratio<=space.ratio){return false;}
                space.set(src);
                return true;
            }
        }
        return false;
    },
    fullness:function(){
        var c=0,i;
        for(i=0;i<this.nstore;i+=1){
            if(this.heap[i]!==null){
                c+=1;
            }
        }
        manage.console.debug("Storage: fullness="+c);
    },
    toind:function(ratio){
        return Math.floor(ratio*this.nstore);
    }
});
// @license-end