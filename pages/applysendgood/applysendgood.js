// applysendgood.js
var app = getApp();
var config = require("../../utils/config.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ApplySendGood: null,
        ProductName: '',
        formId: '',
        express: '请选择物流公司',
        shipOrderNumber: '',
        IsShowExpress: true,
        ExpressList: [],
        index: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this,
            id = options.id,
            skuId = options.skuId;
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl(app.globalData.getReturnDetail),
                data: {
                    openId: openid,
                    returnId: id
                },
                success: function (result) {
                    result = result.data;
                    if (result.success) {
                        var r = result.data;
                        that.setData({
                            ApplySendGood: r
                        });
                    }
                    else if (result.data.Message == 'NOUser') {
                        wx.navigateTo({
                            url: '../login/login'
                        })
                    }
                    else {
                        app.showErrorModal(result.data.Message, function (res) {
                            if (res.confirm) {
                                wx.navigateBack({ delta: 1 })
                            }
                        });
                    }
                },
                complete: function () {
                    that.LoadExpress();//加载物流公司
                }
            })
        })
    },
    bindPickerChange: function (e) {
        var val = e.detail.value,
            tempexpresslist = this.data.ExpressList;
        this.setData({
            express: tempexpresslist[val]
        });
    },
    ShowExpress: function (e) {
        if (this.data.ExpressList.length > 0) {
            this.setData({
                IsShowExpress: false
            });
        } else {
            app.showErrorModal('物流公司加载失败');
            return;
        }
    },
    LoadExpress: function () {
        var that = this;
        wx.request({
            url: app.getUrl(app.globalData.getExpressList),
            success: function (result) {
                result = result.data;
                if (result.success) {
                    var temp = [];
                    result.data.find(function (item, index) {
                        if (item.ExpressName != undefined) {
                            temp.push(item.ExpressName);
                        }
                    });
                    that.setData({
                        ExpressList: temp
                    });
                }
            }
        })
    },
    formSubmit: function (e) {
        var that = this,
            formId = e.detail.formId;
        if (that.data.express == "请选择物流公司") {
            app.showErrorModal('请选择物流公司');
            return;
        }
        var shipnum = that.ToTrim(e.detail.value.txtshipOrderNumber);

        if (shipnum == null || shipnum == "undefined" || shipnum.length <= 0) {
            app.showErrorModal('快递单号不允许为空');
            return;
        }

        app.getOpenId(function (openid) {
            var para = {
                openId: openid,
                skuId: that.data.ApplySendGood.SkuId,
                orderId: that.data.ApplySendGood.OrderId,
                ReturnsId: that.data.ApplySendGood.ReturnId,
                express: that.data.express,
                shipOrderNumber: shipnum,
                formId: formId
            }
            config.httpPost(app.getUrl(app.globalData.returnSendGoods), para, function (result) {
                if (result.success) {
                    wx.showModal({
                        title: '提示',
                        content: result.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                wx.navigateBack({ delta: 1 });
                            }
                        }
                    });
                } else {
                    if (result.msg == 'NOUser') {
                        wx.navigateTo({
                            url: '../login/login'
                        })
                    }
                    else {
                        app.showErrorModal(result.msg, function (res) {
                            if (res.confirm) {
                                wx.navigateBack({ delta: 1 })
                            }
                        });
                    }
                }
            });

        });
    },
    ToTrim: function (str) {
        return str.replace(/(^\s*)|(\s*$)/g, "");
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})