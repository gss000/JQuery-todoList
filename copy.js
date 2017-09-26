;(function(){
    var $form = $('.add-task'),
        $deleteTask ,
        $detailTask,
        $task_detail,
        $mark = $('.mark'),
        $updateForm,
        $contentTitle,
        $contentDiv,
        $taskItem,
        $taskComplete,
        $remindMsg =  $('.remind-msg'),
        $msgContent = $('.msg-content'),
        $remindBtn = $('.remind-msg').find('button'),
        taskList = {};

    init();
    function init(){
        //store.clear();
        taskList = store.get('taskList') || [];
        refresh_task_list();
        task_remind();
        listen_msg();
    }
    $form.on('submit', function(e){
        var newtask = {};
        e.preventDefault();
        var $input = $(this).find('input[name=content]');
        newtask.content = $input.val();
        if(!newtask.content) return;
        if(add_task_newtask(newtask)){
            refresh_task_list();
        }
        $input.val('');
    });
    function add_task_newtask(newtask){
        taskList.push(newtask);
        refresh_task_list();
        return true;
    }
    function refresh_task_list(){
        store.set('taskList', taskList);
        add_task_list();
        listen_task_delte();
        listen_task_detail();
        task_item_complete();
    }
    function add_task_list(){
        var $task_list = $('.task-list');
        $task_list.html('');
        var completed = [];
        for(var i=0;i<taskList.length;i++){
            if(taskList[i] && taskList[i].complete){
                completed[i] = taskList[i];
            }else{
                var task_item = add_task_item(taskList[i], i);
            }
            $task_list.prepend(task_item);
        }
        for(var j=0;j<completed.length;j++){
            var $item = add_task_item(completed[j], j);
            if(!$item) continue;
            $item.addClass('completed');
            $task_list.append($item);
        }

        $deleteTask = $('.action.delete');
        $detailTask = $('.action.detail');
        $task_detail = $('.task-detail');
        $taskItem = $('.taskitem');
        $taskComplete = $('.taskitem-complete');
    }
    function add_task_item(data, index){
        if(!data || index === undefined) return;
        var taskitem =
            '<div class="taskitem" data-index="'+ index +'">' +
            '<span><input class="taskitem-complete"' + (data.complete ? 'checked="true"' : ' ') + 'type="checkbox"/></span>'+
            '<span class="task-content" name="content">'+ data.content +'</span>'+
            '<span class="action detail">详情</span>'+
            '<span class="action delete">删除</span></div>';
        return $(taskitem);
    }
    function listen_task_delte(){
        $deleteTask.on('click', function(){
            var $this = $(this);
            var index = $this.parent().data('index');
            var result = confirm("确定删除");
            result ? delete_task(index) : null;
            refresh_task_list();
        });
    }
    function delete_task(index){
        if(!taskList[index] || index === undefined) return;
        delete taskList[index];
    }
    function listen_task_detail(){
        $detailTask.on('click', function(){
            //console.log(1);
            var $this = $(this);
            var index = $this.parent().data('index');
            task_detail_item(index);

            $('.date-time').datetimepicker();
            $updateForm = $task_detail.find('form');
            $contentTitle = $('.content-title');
            $contentDiv = $('.content');
            $contentDiv.on('dblclick', function(){
                $contentTitle.show();
                $(this).hide();
            })
            $updateForm.on('submit', function(e){
                e.preventDefault();
                var data = {};
                data.content = $(this).find('[name=content]').val();
                data.desc = $(this).find('[name=desc]').val();
                data.remind = $(this).find('[name=remind-date]').val();
                update_remind_data(data, index);
                $(this).parent().hide();
                $mark.hide();
            })
        });
        $mark.on('click', function(){
            $(this).hide();
            $task_detail.hide();
        })
        $taskItem.on('dblclick', function(){
            console.log(1);
            var index = $(this).data('index');
            task_detail_item(index);
        });
    }
    function task_detail_item(index){
        var item = taskList[index];
        if(index === undefined || !item) return;
        var $detail =
            '<form>' +
            '<div class="content">'+ item.content +'</div>'+
            '<input name="content" class="content-title" autocomplete="off" value="'+ (item.content || '') +'"/>'+
            '<textarea name="desc" id="textArea" >'+ (item.desc || '') +'</textarea>'+
            '<div class="remind">'+
            '<p>提醒时间</p>'+
            '<input style="cursor: pointer;" class="date-time"  name="remind-date" value="'+ (item.remind || '') +'">'+
            '<button type="submit">更新</button>'+
            '</div></form>';
        $task_detail.html("");
        $task_detail.html($detail);

        $task_detail.show();
        $mark.show();
    }
    function update_remind_data(data, index){
        if(!index|| !taskList[index]) return;
        taskList[index] = $.extend({}, taskList[index], data);
        refresh_task_list();
    }
    function task_item_complete(){
        $taskComplete.on('click', function(){
            var $this = $(this);
            var index = $this.parent().parent().data('index');
            var item = store.get('taskList')[index];
            if(item.complete){
                update_remind_data({complete: false}, index);
            }else{
                update_remind_data({complete: true}, index);
            }
        });
    }
    function task_remind(){
        var curtime, tasktime;
        var timer = setInterval(function(){
            for(var i=0;i<taskList.length;i++){
                var item = store.get('taskList')[i];
                if(!item || !item.remind || item.informed) continue;
                curtime = (new Date()).getTime();
                tasktime = (new Date(item.remind)).getTime();
                if(curtime - tasktime >= 1){
                    update_remind_data({informed: true}, i);
                    show_msg(item.content);
                }
            }
        }, 500);
    }
    function listen_msg(){
        $remindBtn.on('click', function(){
            $remindMsg.hide(300);
        })
    }
    function show_msg(msg){
        $msgContent.html(msg);
        $remindMsg.show(300);
    }




})()