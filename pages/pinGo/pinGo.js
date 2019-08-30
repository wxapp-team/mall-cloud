var config = require("../../utils/config.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNo: 1,
    pinGoHeight: wx.getSystemInfoSync().windowHeight,
    isEnd: false,
    total:0,
    timeGoBanner: "../../images/countdown-banner.jpg",
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that=this;
    //获取拼团banner
    wx.getStorage({
      key: 'topiclist',
      success: function (res) {
        that.setData({
          timeGoBanner:res.data[3].content.dataset[0].pic
        })
      },fail:function(){

      }})
    this.getData()
  },
  getData: function () {
    const that = this;
    config.httpGet(app.getUrl('FightGroup/GetActiveList'), {
      pageNo: that.data.pageNo,
      pageSize: 12,
      openId: app.globalData.openId
    }, function (res) {
      var total =res.data.total;

      res = res.data.rows;
      that.setData({
        list: that.data.list.concat(res),
        total: total
      });
      if (that.data.list.length == that.data.total) {
        that.setData({
          isEnd: true
        });
      }
    });
  },

  showDetail(e) {
    wx.navigateTo({
      url: '../groupproduct/groupproduct?id=' + e.currentTarget.dataset.id,
    })
  },

  bindUserTap: function (e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.isEnd) {
      this.setData({
        pageNo: this.data.pageNo + 1
      })
      this.getData()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})