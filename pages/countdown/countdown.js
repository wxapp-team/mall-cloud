var app = getApp();
Page({
  data: {
    pageSize: 12,
    pageIndex: 1,
    CountDownList: [],
    hasData: true,
    showtab: 0, //顶部选项卡索引
    tabnav: {
      tabnum: 5,
      tabitem: [{
          "id": 0,
          "text": "7:00-8:00"
        },
        {
          "id": 1,
          "text": "8:00-9:00"
        },
        {
          "id": 2,
          "text": "9:00-10:00"
        },
        {
          "id": 3,
          "text": "10:00-11:00"
        },
        {
          "id": 4,
          "text": "11:00-12:00"
        }
      ]
    }
  },
  onLoad: function(options) {
    this.loadData(1);
  },
  setTab: function(e) {
    const edata = e.currentTarget.dataset;
    this.setData({
      showtab: edata.tabindex,
    })
  },
  loadData: function(pageindex) {
    var that = this;
    wx.showNavigationBarLoading();
    wx.request({
      url: app.getUrl(app.globalData.getLimitBuyList),
      data: {
        pageIndex: pageindex,
        pageSize: that.data.pageSize
      },
      success: function(result) {
        result = result.data;
        if (result.success) {
          var r = result.data;
          if (r.length < that.data.pageSize) {
            that.setData({
              hasData: false
            });
          }
          var old = that.data.CountDownList;
          old.push.apply(old, r);
          that.setData({
            CountDownList: old
          });
        } else {
          wx.showModal({
            title: '提示',
            content: result.msg,
            showCancel: false,
            success: function(res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }
      },
      complete: function() {
        wx.hideNavigationBarLoading();
      }
    })
  },
  BuyCountDown: function(e) {
    var countdownId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../countdowndetail/countdowndetail?id=' + countdownId
    })
  },
  onReachBottom: function() {
    if (this.data.hasData) {
      var pageindex = this.data.pageIndex + 1;
      this.setData({
        pageIndex: pageindex
      });
      this.loadData(pageindex);
    }
  }
});