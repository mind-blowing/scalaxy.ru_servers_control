function Scalaxy(options) 
{
    if(typeof(options) == 'undefined') {
        options = {}
    }
    
    this.info = null
    this.projectId = null
    this.instances = null
    this.balance = null

    this.infoUrl = "https://www.scalaxy.ru/api/info.json?rnd={rnd}"
    if(typeof(options.infoUrl) != 'undefined') {
        this.infoUrl = options.infoUrl
    }
    
    this.alldataUrl = "https://www.scalaxy.ru/api/alldata.json?project_id={projectId}&rnd={rnd}"
    if(typeof(options.alldataUrl) != 'undefined') {
        this.alldataUrl = options.alldataUrl
    }
    
    this.eventsUrl = "https://www.scalaxy.ru/api/projects/{projectId}/events.json?rnd={rnd}"
    if(typeof(options.eventsUrl) != 'undefined') {
        this.eventsUrl = options.eventsUrl
    }
    
    this.runUrl = "https://www.scalaxy.ru/api/projects/{projectId}/instances/{instanceId}/run.json?rnd={rnd}"
    if(typeof(options.runUrl) != 'undefined') {
        this.runUrl = options.runUrl
    }
    
    this.terminateUrl = "https://www.scalaxy.ru/api/projects/{projectId}/instances/{instanceId}/terminate.json?rnd={rnd}"
    if(typeof(options.terminateUrl) != 'undefined') {
        this.terminateUrl = options.terminateUrl
    }
    
    this.rebootUrl = "https://www.scalaxy.ru/api/projects/{projectId}/instances/{instanceId}/reboot.json?rnd={rnd}"
    if(typeof(options.rebootUrl) != 'undefined') {
        this.rebootUrl = options.rebootUrl
    }
}

Scalaxy.prototype = {
    getRnd : function(){
        return new Date().getTime();
    },
    loadInfo : function(){
        var obj = this
        $.getJSON($.nano(this.infoUrl, {rnd: this.getRnd()}), function(data){
            if(typeof(data.project_id) != 'undefined') {
                obj.projectId = data.project_id
                obj.info = data
                obj.loadData()
            }
        })
    },
    loadData : function(){
        var obj = this
        $.ajax({url: $.nano(this.alldataUrl, {rnd: this.getRnd(), projectId: obj.projectId}), type: 'GET', 'dataType': 'json', success: function(data){
            if(typeof(data.instances) != 'undefined') {
                obj.instances = data.instances
                obj.balance = data.balance
                obj.renderList()
            }
        }, error: function(){
            $('body').text('Error')
        }})
    },
    stop: function(a){
        $.ajax({url: $.nano(this.terminateUrl, {rnd: this.getRnd(), projectId: this.projectId, instanceId: a.data('instanceId')}), type: 'PUT', 'dataType': 'json', success: function(data){
            a.data('status', data.current_status)
            a.removeClass('power-on')
            a.addClass('power-wait')
        }})
    },
    start: function(a){
        $.ajax({url: $.nano(this.runUrl, {rnd: this.getRnd(), projectId: this.projectId, instanceId: a.data('instanceId')}), type: 'PUT', 'dataType': 'json', success: function(data){
            a.data('status', data.current_status)
            a.removeClass('power-off')
            a.addClass('power-wait')
        }})
    },
    changeStatus: function(a){
        if(a.data('status') == 'running') {
            this.stop(a)
        } else if(a.data('status') == 'stopped') {
            this.start(a)
        }
    },
    getClassName: function(status){
        var className;
        switch(status) {
            case 'running':
                className = 'power-on'
                break
            case 'stopped':
                className = 'power-off'
                break
            default:
                className = 'power-wait'
                break
        }
        
        return className
    },
    renderList : function(){
        var obj = this
        
        $('body').append($.nano(templates.balance, {balance: this.balance}))
        $.each(this.instances, function(key, item){        
            $('body').append($.nano(templates.item, {id: 'instance-' + item.id, 'class': obj.getClassName(item.current_status), 'name': item.name, ip_ext: item.ip_ext}))
            $('#instance-' + item.id).data('status', item.current_status)
            $('#instance-' + item.id).data('instanceId', item.id)
            $('#instance-' + item.id).click(function(){
                obj.changeStatus($(this))
            })
        })
    }
}