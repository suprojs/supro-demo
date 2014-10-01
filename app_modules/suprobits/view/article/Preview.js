Ext.define('FV.view.article.Preview', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.articlepreview',

    requires: ['Ext.toolbar.Toolbar'],

    cls: 'preview',
    autoScroll: true,
    border: false,
	
    
    initComponent: function() {
        Ext.apply(this, {
            tpl: new Ext.XTemplate(
                '<div class="post-data">',
                    '<span class="post-date">{pubDate:this.formatDate}</span>',
                    '<h3 class="post-title">{title}</h3>',
                    '<h4 class="post-author">{author:this.defaultValue}</h4>',
                '</div>',
                '<div class="post-body">{content:this.getBody}</div>', {

                getBody: function(value, all) {
                    return Ext.util.Format.stripScripts(value);
                },

                defaultValue: function(v) {
                    return v ? v : 'Unknown';
                },

                formatDate: function(value) {
                    if (!value) {
                        return '';
                    }
                    return Ext.Date.format(value, 'M j, Y, H:i:s');
                }
            }),

/*			html: '<div style="text-align:center;vertical-align:top"><button id="screenshot-button">Capture</button><button id="screenshot-stop-button">Stop</button><br/><video id="screenshot-stream" style="height:320;width:240"autoplay></video><img id="screenshot" src=""><canvas id="screenshot-canvas" style="display:none;"></canvas></div>',
			
			listeners: {
                'afterrender': function(){
				(function screenshot(){
//from http://www.html5rocks.com/en/tutorials/getusermedia/intro/
	var video=document.querySelector('#screenshot-stream');
	var button=document.querySelector('#screenshot-button');
	var canvas=document.querySelector('#screenshot-canvas');
	var img=document.querySelector('#screenshot');
	var ctx=canvas.getContext('2d');
	var localMediaStream=null ,j=0;
	function sizeCanvas(){
		setTimeout(function(){
		console.log('w: ' + video.videoWidth + 'h: ' + video.videoHeight)
			canvas.width=img.width=640;//video.videoWidth;
			canvas.height=img.height=480;//video.videoHeight;
			//img.height=640;//video.videoHeight;
			//img.width=480;//video.videoWidth;
		},100);
	}
	function snapshot(){
		ctx.drawImage(video,0,0);
		img.src=canvas.toDataURL();//'image/png'
		//console.log(imgblob)//'image/png' default
		var imgblob=new Buffer(canvas.toDataURL().slice(22),'base64')
var fs = require('fs'); var fd = fs.openSync(process.cwd()+'/file'+(j++)+'.png','w+');
fs.writeSync(fd,imgblob,0,imgblob.length,0);fs.closeSync(fd);

		
	}
	button.addEventListener('click',function(e){
	console.log('button click')
		if(localMediaStream){
			snapshot();
			return;
		}
		if(navigator.getUserMedia){
			navigator.getUserMedia('video',function(stream){
				video.src=stream;
				localMediaStream=stream;
				sizeCanvas();
				button.textContent='Take Shot';
			},onFailSoHard);
		}else if(navigator.webkitGetUserMedia){
			navigator.webkitGetUserMedia({
				video:true
			},function(stream){
				video.src=window.webkitURL.createObjectURL(stream);
				localMediaStream=stream;
				sizeCanvas();
				button.textContent='Take Shot';
			},onFailSoHard);
		}else{
			onFailSoHard({
				target:video
			});
		}
	},false);
	var idx=0;
	var filters=['grayscale','sepia','blur','brightness','contrast','hue-rotate','hue-rotate2','hue-rotate3','saturate','invert',''];
	function changeFilter(e){
		var el=e.target;
		el.className=img.className='';
		var effect=filters[idx++%filters.length];
		if(effect){
			el.classList.add(effect);
			img.classList.add(effect);
		}
	}
	video.addEventListener('click',changeFilter,false);
	
	document.querySelector('#screenshot-stop-button').addEventListener('click',function(e){
	video.pause();
	localMediaStream.stop();
},false);
})();
                        
                }
            },*/
			
            dockedItems: [{
                dock: 'top',
                xtype: 'toolbar',
                items: [{
                    iconCls: 'tab-new',
                    text: l10n.docViewInTab,
                    action: 'viewintab'
                }, {
                    iconCls: 'post-go',
                    text: l10n.docGoToLink,
                    action: 'gotopost'
                }]
            }]
        });

        this.callParent(arguments);
    }
});
