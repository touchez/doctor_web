var examineNum = 0;
var add_examineNum;
var medicalRecord;
var examinationAll;
var examination_HTML = "";
var drugAll;
var add_drugNum =0;
var drug_HTML = "";
var examinationTypesIds = new Array();
var drugs = new Array();
var medicalRecordId;

//获取当前病例
function setMedicalRecord(id,isHis) {
    var xhr = new XMLHttpRequest();
    medicalRecordId = id;
    xhr.open("GET","https://touchez.cn:8090/medicalRecord/web?medicalRecordId="+id,true);
    xhr.onload = function(){
        medicalRecord= JSON.parse(this.responseText).data;
        loadCurRecord();
        loadCurExamination();
        loadCurDrug();
        if(!isHis){
            loadMedicalHistory();
        }
    };
    xhr.send();
}
//获取当前病例的诊断部分
function loadCurRecord() {
    var medicalRecordCur= medicalRecord.medicalrecord;
    medicalRecordId = medicalRecordCur.medicalrecordId;
    var output_symptom = document.getElementById('symptom').innerHTML;
    output_symptom += medicalRecordCur.symptom;
    if(medicalRecordCur.symptom!=null){
        document.getElementById('symptom').innerHTML = output_symptom;
    }
    var output_primaryDiagnosis = document.getElementById('primaryDiagnosis').innerHTML;
    output_primaryDiagnosis += medicalRecordCur.medicalrecordContentFirst;
    if(medicalRecordCur.medicalrecordContentFirst!=null){
        document.getElementById('primaryDiagnosis').innerHTML = output_primaryDiagnosis;
    }
    var output_finalDiagnosis_text = document.getElementById('finalDiagnosis_text').innerHTML;
    output_finalDiagnosis_text += medicalRecordCur.medicalrecordContentFinally;
    if(medicalRecordCur.medicalrecordContentFinally!=null){
        document.getElementById('finalDiagnosis').style.display = "";
        document.getElementById('finalDiagnosis_text').innerHTML = output_finalDiagnosis_text;
    }
}
//获取当前病例检查
function loadCurExamination() {
    var responseSimpleExaminationTypes = medicalRecord.responseSimpleExaminationTypes;
    if(responseSimpleExaminationTypes!=null){
        document.getElementById('examine').style.display = "";
        var output = document.getElementById('examine').innerHTML;
        for(var i in responseSimpleExaminationTypes){
            examinationTypesIds[examineNum]=responseSimpleExaminationTypes[i].examinationTypeId;
            examineNum++;
            add_examineNum = examineNum;
            output += `
                  <div class="examine_item_div" onclick="open_report()">检查${examineNum}：${responseSimpleExaminationTypes[i].generalString}</div>
					`;
        }
        document.getElementById('examine').innerHTML = output;
    }
}
//获取当前病例药品
function loadCurDrug() {
    var treatmentDrugOrders = medicalRecord.treatmentDrugOrders;
    if(treatmentDrugOrders!=null){
        if(treatmentDrugOrders[0] != null){
            document.getElementById('medicine').style.display = "";
        }
        var output = document.getElementById('medicine').innerHTML;
        for(var i in treatmentDrugOrders){
            drugs.push(treatmentDrugOrders[i]);
            output += `
                 <div class="medicine_item">
                    <div class="medicine_name">${treatmentDrugOrders[i].drugName}</div>
                    <div class="medicine_time">${treatmentDrugOrders[i].drugCount}盒 用法：${treatmentDrugOrders[i].instructDays}次/天 一次${treatmentDrugOrders[i].instructCountPerDay}片</div>
                </div>
					`;
            document.getElementById('medicine').innerHTML = output;
        }

    }

}
//获取过往病史
function loadMedicalHistory(){
    var medicalHistory = medicalRecord.simpleMedicalRecords;
    var output = document.getElementById('cureHis').innerHTML;
    for(var i in medicalHistory){
        output += `
                  <div class="cureItem" id=${medicalHistory[i].medicalRecordId} onclick="openNewHistory(id)">
                        <div class="diseaseName" >${medicalHistory[i].generalName}</div>
                        <div class="diseaseTime">${medicalHistory[i].departmentName}</div>
                        <div class="hospital">${medicalHistory[i].hospitalName}</div>
                   </div>
					`;
    }
    document.getElementById('cureHis').innerHTML = output;
}
//获取全部检查
function setExaminationAll(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET","https://touchez.cn:8090/examtype/all",true);
    xhr.onload = function(){
        examinationAll = JSON.parse(this.responseText).data;
        for (var i in examinationAll){
            examination_HTML += `
                  <option value=${examinationAll[i].examinationTypeId}>${examinationAll[i].generalString}</option>
				`;
        }
    };
    xhr.send();
}
//获取全部药品
function setDrugAll(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET","https://touchez.cn:8090/drug/all",true);
    xhr.onload = function(){
        drugAll = JSON.parse(this.responseText).data;
        for (var i in drugAll){
            drug_HTML += `
                  <option value="${drugAll[i].drugId}_${drugAll[i].drugPrice}">${drugAll[i].drugName}</option>
				`;
        }
    };
    xhr.send();
}

//加检查
function add_examine(){
    examineNum++;
    var output = document.getElementById('examine').innerHTML;
    output += `
               <div class="examine_item">检查 ${examineNum} ：
                      <select class="examine_item" name="examine${examineNum}">
               `+examination_HTML+`
                    </select>
               </div>
				`;
    document.getElementById('examine').innerHTML = output;
}
//加药
function add_medicine(){
    add_drugNum++;
    var output = document.getElementById('medicine').innerHTML;
    output += `
               <div class="medicine_item">
                    <div class="medicine_name">
                        <select name="drug${add_drugNum}" id="drug${add_drugNum}">
                            `+drug_HTML+`
                        </select>
                    </div>
                    <div class="medicine_time"><input type="text" id="drugCount${add_drugNum}">
                    盒 用法：<input type="text" id="instructDays${add_drugNum}">次/天 一次<input type="text" id="instructCountPerDay${add_drugNum}">片</div>
                </div>
				`;
    document.getElementById('medicine').innerHTML = output;
}

//提交病例
function submit_firstCure(){
    var symptom = document.getElementById('symptom').innerHTML;
    var medicalrecordContentFirst = document.getElementById('primaryDiagnosis').innerHTML;
    var medicalrecordContentFinally = document.getElementById('finalDiagnosis_text').innerHTML;
    var examineNum_D = examineNum-add_examineNum;
    for(var i=0;i<examineNum_D;i++){
        add_examineNum++;
        examinationTypesIds[add_examineNum-1] = document.getElementsByName("examine"+add_examineNum)[0].value;

    }

    var drugNum_D =add_drugNum;
    for(var i=1;i<=drugNum_D;i++){
        var drugId = document.getElementsByName("drug"+i)[0].value.split('_')[0];
        var drugPrice = document.getElementsByName("drug"+i)[0].value.split('_')[1];
        var obj = document.getElementById("drug"+i); //定位id
        var index = obj.selectedIndex; // 选中索引
        var drugName = obj.options[index].text; // 选中文本
        var drugCount = document.getElementById("drugCount"+i).value;
        var instructDays = document.getElementById("instructDays"+i).value;
        var instructCountPerDay = document.getElementById("instructCountPerDay"+i).value;
        var totalPrice = drugPrice*drugCount;
        var drug = new Drug(drugCount,drugId,drugName,drugPrice,instructCountPerDay,instructDays,totalPrice);
        drugs.push(drug);

    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST","https://touchez.cn:8090/medicalRecord/web/post",true);
    var data;
    xhr.setRequestHeader("Content-Type", "application/json");
    data = JSON.stringify(
        {
            "examinationTypesId": examinationTypesIds,
            "medicalrecord": {
                "general":"高血压",
                "departmentId": medicalRecord.medicalrecord.departmentId,
                "doctorId": medicalRecord.medicalrecord.doctorId,
                "medicalrecordContentFirst": medicalrecordContentFirst,
                "medicalrecordContentFinally":medicalrecordContentFinally,
                "symptom": symptom,
                "userId": medicalRecord.medicalrecord.userId,
                "medicalRecordId" : medicalRecordId
            },
            "treatmentDrugOrders": drugs
        }
    );
    xhr.send(data);
    alert("提交成功！");
}

function Drug(drugCount,drugId,drugName,drugPrice,instructCountPerDay,instructDays,totalPrice) {
    this.drugCount = drugCount;
    this.drugId = drugId;
    this.drugName = drugName;
    this.drugPrice = drugPrice;
    this.instructCountPerDay = instructCountPerDay;
    this.instructDays = instructDays;
    this.totalPrice = totalPrice;
}


//open('examine_report.html')
function open_report(){
    window.location.href="examine_report.html";
}