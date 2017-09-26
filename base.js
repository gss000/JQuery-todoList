;(function(){
    var $formAddtask = $('.add-task'),
        $deleteTask,
        $detailAction,
        $detailTask,
        $markTask = $('.mark'),
        $updateform,
        $form_content_title,
        $form_content_input,
        $taskItem,
        $checkboxComplete,
        $remindMsg =  $('.remind-msg'),
        $msgContent = $('.msg-content'),
        $remindBtn = $('.remind-msg').find('button'),
        taskList = {};

    init();
    function init(){//初始化执行函数
        //store.clear('');
        taskList = store.get('taskList') || [];
        //if(taskList.length){
        //    add_task_list();
        //}
        refresh_task_list();
        task_remind();
        listen_handler_msg();
    }
    //function $alert(args){
    //    if(!args){}
    //    var conf = {};
    //    if(typeof args == 'string'){
    //        conf.title = args;
    //    }else{
    //        conf = $.extend(conf, args);
    //    }
    //}
    //提醒功能，需要每时每刻都监听
    function task_remind(){
        var current_time, task_time;
        var timer = setInterval(function(){
            for(var i=0;i<taskList.length;i++){
                var item = store.get('taskList')[i];
                if(!item || !item.remind_date || item.informed) continue;
                //不存在或者不是提醒时间或者已经提醒过的，就continue
                current_time = (new Date()).getTime();
                task_time = (new Date(item.remind_date)).getTime();
                if(current_time - task_time >= 1){
                    update_taskList_item({informed: true}, i);
                    show_msg(item.content);
                }
            }
        }, 1000);

    }
    function listen_handler_msg(){
        $remindBtn.on('click', function(){
            $remindMsg.hide(300);
        });
    }
    function show_msg(msg){
        $msgContent.html(msg);
        $remindMsg.show(300);
    }

    $formAddtask.on('submit', function(e){
        var newTaskval = {};
        e.preventDefault();
        var $input = $(this).find('input[name=content]');
        newTaskval.content = $input.val();
        if(!newTaskval.content) return;
        if(add_task(newTaskval)){
            console.log(taskList)
            refresh_task_list();
        }
        $input.val('');
    });
    //jQuery不会自动监听绑定事件,以及自动更新文档流.
    //所以绑定的对象需要每次更新都重新赋值,绑定的事件也需重新绑定
    function listen_handler_delete(){
        $deleteTask.on('click',function(){
            var $this = $(this);
            var index = $this.parent().data('index');
            var result = confirm('确认删除？');
            result ? delete_task(index) : null;
            refresh_task_list();
        });

    }
    function listen_handler_detail(){
        $detailAction.on('click', function(){
            console.log(1);
            var $this = $(this);
            var index = $this.parent().data('index');
            //console.log(index);
            add_task_detail(index);
            $detailTask.show();
            $markTask.show();

        });
        $markTask.on('click', function(){
            $(this).hide();
            $detailTask.hide();
        });
        $taskItem.on('dblclick', function(){
            $detailTask.show();
            $markTask.show();

        });
    }
    function listen_handler_complete(){//input是否勾选监听
        $checkboxComplete.on('click', function(){
            var $this = $(this);
            var index = $this.parent().parent().data('index');
            var item = store.get('taskList')[index];
            if(item.complete){
                update_taskList_item({complete: false}, index);
            }else{
                update_taskList_item({complete: true}, index);
            }
        });
    }

    function add_task(newtask){//
        taskList.push(newtask);
        refresh_task_list();
        return true;
    }
    function delete_task(index){//删除索引
        if(index === undefined || !taskList[index]) return;
        delete taskList[index];
    }
    function update_taskList_item(data, index){
        if(!index || !taskList[index]) return;
        //taskList[index] = $.merge({}, taskList[index], data);//合并对象，三个参数合并
        taskList[index] = $.extend({}, taskList[index], data);
        refresh_task_list();
    }
    function refresh_task_list(){//重新刷新列表
        store.set('taskList', taskList);
        add_task_list();
        listen_handler_delete();
        listen_handler_detail();
        listen_handler_complete();
    }
    function add_task_list(){//添加列表
        var $task_list = $('.task-list');
        $task_list.html('');
        var complete_items = [];//用来存放已经被选中的input
        for(var i=0;i<taskList.length;i++){
            if(taskList[i] && taskList[i].complete){
                complete_items[i] = taskList[i];
            }else{
                var $task_item = add_task_item(taskList[i], i);
            }
            $task_list.prepend($task_item);
        }
        for(var j=0;j<complete_items.length;j++){//遍历已经被选中的input
            var $task_item = add_task_item(complete_items[j], j);
            if(!$task_item) continue;
            $task_item.addClass('completed');
            $task_list.append($task_item);
        }
        $deleteTask = $('.action.delete');
        $detailAction = $('.action.detail');
        $taskItem = $('.taskitem');
        $detailTask = $('.task-detail');
        $checkboxComplete = $('.taskitem-complete');
    }
    //DOM操作，编写每一个item
    function add_task_item(data, index){
        if(!data || !index) return;//考虑是否存在数据和索引，假如没有就需要直接返回
        var task_item =
        '<div class="taskitem" data-index="'+ index +'">'+
            '<span><input class="taskitem-complete" '+ (data.complete ? 'checked="true"' : ' ') +'type="checkbox"/></span>'+
            '<span class="task-content" name="content">'+ data.content +'</span>'+
        '<span class="action detail">详情</span>'+
        '<span class="action delete">删除</span></div>';
        return $(task_item);
    }
    //渲染指定detail的信息
    function add_task_detail(index){
        if(index === undefined || !taskList[index]) return;
        var item = taskList[index];
        var details =
            '<form><div class="content">'+ item.content +'</div>' +
            '<input name="content" class="content-title" autocomplete="off" value="'+ (item.content || '') +'"/>'+
            '<textarea name="desc">'+ (item.desc || '') +'</textarea>'+
            '<div class="remind"><p>提醒时间</p>'+
            '<input style="cursor: pointer;" class="date-time"name="remind_date" value="'+ (item.remind_date || ' ') +'">'+
            '<button type="submit">更新</button></div></form>';
        $detailTask.html('');
        $detailTask.html(details);

        $('.date-time').datetimepicker();
        $updateform = $detailTask.find('form');
        $form_content_title = $updateform.find('.content');
        $form_content_input = $updateform.find('.content-title');
        $form_content_title.on('dblclick',function(){
            $form_content_title.hide();
            $form_content_input.show();
        });
        $updateform.on('submit', function(e){//更新弹出框表单内容到taskList上
            e.preventDefault();
            var data = {};
            data.content = $(this).find('[name=content]').val();
            data.desc = $(this).find('[name=desc]').val();
            data.remind_date = $(this).find('[name=remind_date]').val();
            update_taskList_item(data, index);
            $(this).parent().hide();
            $markTask.hide();
        })
    }
})();