var app = getApp();
Page({
  data: {
    pageSize: 12,
    pageIndex: 1,
    showHot:true,
    showList:false,
    timeGoHeight: wx.getSystemInfoSync().windowHeight,
    TabCur: 2,
    curType:0,
    inter:null,
    timeC:10,
    randHot:[],
    randHotData:[],
    scrollLeft: 0,
    CountDownList: [],
    total:0,
    hasData: true,
    activeText: "",
    showtab: 0, //顶部选项卡索引
    tabnav:  [{
        "id": 0,
        "text": "7:00",
        "type":0,
        "tip":"已开抢"
      },
      {
        "id": 1,
        "text": "8:00-9:00",
        "type": 1,
        "tip": "抢购中"
      },
      {
        "id": 2,
        "text": "9:00-10:00",
        "type": 2,
        "tip": "抢购进行中"
      },
      {
        "id": 3,
        "text": "10:00",
        "type":3,
        "tip": "即将开抢"
      },
      {
        "id": 4,
        "text": "11:00",
        "type": 4,
        "tip": "即将开抢"
      },
        {
          "id": 5,
          "text": "12:00",
          "type": 5,
          "tip": "即将开抢"
        }
      ]
  },
  onLoad: function (options) {
    this.getTimeTab();
    let that = this;
    setTimeout(function () {
      that.setData({
        loading: true
      })
    }, 0)
  },
  tabSelect(e) {
    clearInterval(this.data.inter);
    wx.showLoading({
      title: '',
      icon:"none"
    })
    this.timeCompare(e.currentTarget.dataset.start, e.currentTarget.dataset.end);//时间比较
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      curType: e.currentTarget.dataset.type,
      pageIndex:1,
      inter:null,
      hasData:true,
      timeC:10,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    });
    
    // this.setData({ //在抢购中显示实时热抢
        this.data.showHot=e.currentTarget.dataset.selected;
      // });
    this.loadData(this.data.pageIndex, this.data.curType, true, this.data.showHot)
  },
  setTab: function (e) {
    const edata = e.currentTarget.dataset;
    this.setData({
      showtab: edata.tabindex,
    })
  },
  // 获取实时热抢三个商品
  changeHot:function(len){
    if(len<=3){//商品数量大于三个才显示实时热抢
      return false;
    }
    const that=this;
    this.data.inter=setInterval(function(){
      var time=that.data.timeC;
      if(time<=0){
        that.data.randHot = [];
        that.data.randHotData = []
         
        var arr = that.data.CountDownList
        let i = arr.length;
        while (i) {
          let j = Math.floor(Math.random() * i--);
          [arr[j], arr[i]] = [arr[i], arr[j]];
        }
        that.data.randHotData.push(arr[0])
        that.data.randHotData.push(arr[1])
        that.data.randHotData.push(arr[2])

        time=10;
      }else{
        time=time-1;
      }
      that.setData({ timeC: time, randHot: that.data.randHot, randHotData: that.data.randHotData})
    },1000)
  },
  
  // 时间比较
  timeCompare: function (start, end) {
    var date = new Date();
    var activetext = "即将开始";
    start = new Date(date.toLocaleDateString()+" "+start);
    end = new Date(date.toLocaleDateString() + " " + end);

    if (date >= start && date < end) {
      activetext = "抢购中>";
    } else if (date >= end) {
      activetext = "抢购>";
    } else {
      activetext = "即将开始";
    }
    this.setData({
      activeText: activetext
    })
  },
  // 获取时间段列表
  getTimeTab:function(){
    const that=this;
    wx.showNavigationBarLoading();
    wx.request({
      url: app.getUrl(app.globalData.GetLimitBuyListSpan),
      data: {},
      success: function (result) {
        if(result.data.success){
          that.setData({
            tabnav:result.data.data
          });
          for(let i=0;i<that.data.tabnav.length;i++){
            if (that.data.tabnav[i].selected){
              that.timeCompare(that.data.tabnav[i].start, that.data.tabnav[i].end);//时间比较
              that.setData({
                TabCur:i,
                curType: that.data.tabnav[i].type
              });
            }
          }
          
          that.loadData(1, that.data.curType,true,that.data.showHot);
        }
      },
      complete: function () {
        wx.hideNavigationBarLoading();
      }});
  },
  loadData: function (pageindex,type,isnull,showHot) {
    /*parmas
    pageindex:页码，
    type:限时购类型，
    isnull：是否清空所有数据，点击tab切换时true，下拉刷新时false
    showHot:是否显示实时热抢
    */ 
    var that = this;
    wx.showNavigationBarLoading();
    wx.showLoading({
      title: '',
      icon:"none"
    });
    if(isnull){//清空数据
      this.setData({
        CountDownList:[],
        randHot:[],
        randHotData:[],
        showList:false
      });
    }
    wx.request({
      url: app.getUrl(app.globalData.GetLimitBuyListByType),
      data: {
        pageIndex: pageindex,
        pageSize: that.data.pageSize,
        type:type
      },
      success: function (result) {
        result = result.data;
        if (result.success) {
          var r = result.data;
          if(r.length){
            that.data.total = r[0].total;
          }else{
            that.data.total = 0;
          }
          
        
          var old = that.data.CountDownList;
          old.push.apply(old, r);
          // 用以判断下拉是否加载更多数据
          if (old.length == that.data.total) {
            that.data.hasData=false;
          }else{
           that.data.hasData=true;
          }
          that.setData({
            CountDownList: old,
            hasData:that.data.hasData
          });
          
          
          var len = that.data.CountDownList.length;
          if(len==0){
            showHot = false;
            this.data.showHot=false;
          }
          if (len > 3) {//商品数量大于三个才显示实时热抢
          

            var arr = that.data.CountDownList
            let i = arr.length;
            while (i) {
              let j = Math.floor(Math.random() * i--);
              [arr[j], arr[i]] = [arr[i], arr[j]];
            } 
            that.data.randHotData.push(arr[0])
            that.data.randHotData.push(arr[1])
            that.data.randHotData.push(arr[2])
            that.changeHot(that.data.CountDownList.length);


          }
    
          setTimeout(function(){
            that.setData({
              showHot: showHot,
              showList: true
            })
          },1000);
        } else {
          wx.showModal({
            title: '提示',
            content: result.msg,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }
      },
      complete: function () {
        wx.hideNavigationBarLoading();
        wx.hideLoading();
      }
    })
   
  },
  BuyCountDown: function (e) {
    var countdownId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../countdowndetail/countdowndetail?id=' + countdownId
    })
  },
  onReachBottom: function () {//下拉加载
    if (this.data.hasData) {
      var pageindex = this.data.pageIndex + 1;
      this.setData({
        pageIndex: pageindex
      });
      
      this.loadData(pageindex, this.data.curType,false,this.data.showHot);
    }
  }
});