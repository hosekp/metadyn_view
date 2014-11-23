/** @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
* Copyright (C) 2014  Petr Hošek
*/
if(typeof manage==="undefined"){manage={};}
if(typeof manage.storage==="undefined"){manage.storage={};}
$.extend(manage.storage,{
    heap:null,
    nstore:40,
    init:function(){
        delete this.heap;
        this.heap=[];
        for(var i=0;i<this.nstore;i++){
            this.heap.push(null);
        }
    },
    reset:function(){
        this.init();
    },
    save:function(space){
        if(!this.heap){this.init();}
        var ind=this.toind(space.ratio);
        if(this.heap[ind]===null){
            this.heap[ind]=space.copy();
        }
        //this.fullness();
    },
    load:function(space,ratio){
        if(!this.heap){this.init();}
        var ind=this.toind(ratio);
        var low=this.toind(space.ratio);
        for(var i=ind;i>low;i--){
            if(this.heap[i]){
                var src=this.heap[i];
                if(src.ratio>ratio){continue;}
                if(src.ratio<=space.ratio){return false;}
                space.set(src);
                return true;
            }
        }
        return false;
    },
    fullness:function(){
        var c=0;
        for(var i=0;i<this.nstore;i++){
            if(this.heap[i]!==null){
                c++;
            }
        }
        manage.console.debug("Storage: fullness="+c);
    },
    toind:function(ratio){
        return Math.floor(ratio*this.nstore);
    }
});
// @license-end