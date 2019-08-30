// coupondetail.js
var config = require("../../utils/config.js");
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        CouponName: '',
        Price: 0,
        LimitText: '',
        CanUseProducts: '',
        CouponsDate: '',
        CouponId: '',
        coupimg: app.getRequestUrl + '/Images/coupdetail-back.jpg',
        coupimgLine: app.getRequestUrl + '/Images/coup-line.jpg',
        Remark: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this,
            id = options.id;
        that.setData({
            CouponId: id
        });
        var parameters = {
            openId: app.globalData.openId,
            couponId: id
        }
        config.httpGet(app.getUrl(app.globalData.loadCouponDetails), parameters, that.getCouponsData);
    },
    getCouponsData: function(res) {
        var that = this;
        if (res.success == true) {
            var coupons = res.data;
            var startTime = coupons.StartTime.substring(0, 10).replace("-", ".");
            var closeTime = coupons.ClosingTime.substring(0, 10).replace("-", ".");
            var canUseProducts = "";
            if (coupons.UseArea == 1) {
                canUseProducts = "部分商品可用"
            } else {
                canUseProducts = "全场通用"
            }
            var limitText = "";
            if (coupons.OrderUseLimit > 0) {
                limitText = "订单满" + coupons.OrderUseLimit.toFixed(2) + "元可用";
            } else {
                limitText = "订单金额无限制";
            }

            that.setData({
                CouponName: coupons.CouponName,
                Price: coupons.Price,
                LimitText: limitText,
                CanUseProducts: canUseProducts,
                CouponsDate: startTime + "~" + closeTime,
                CouponId: coupons.CouponId,
                Remark: coupons.Remark == null ? "" : coupons.Remark
            });
        } else {
            var erromsg = res.msg || "";
            app.showErrorModal(res.msg, function(res) {
                if (res.confirm) {
                    wx.navigateBack({
                        delta: 1
                    })
                }
            });
        }
    },
    GetCoupon: function() {
        var coupId = this.data.CouponId,
            that = this;
        if (coupId == "" || parseInt(coupId) <= 0) {
            app.showErrorModal('领取的优惠券不存在', function(res) {
                if (res.confirm) {
                    wx.navigateBack({
                        delta: 1
                    })
                }
            });
            return;
        }

        app.getOpenId(function(openid) {
            wx.request({
                url: app.getUrl(app.globalData.userGetCoupon),
                data: {
                    openId: openid,
                    couponId: coupId
                },
                success: function(result) {
                    result = result.data;
                    if (result.success) {
                        wx.showModal({
                            title: '提示',
                            content: result.msg,
                            showCancel: false
                        })

                    } else {
                        if (result.code == '502') {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        } else {
                            that.setData({
                                backShow: 'none',
                                couponShow: 'none'
                            })
                            wx.showToast({
                                title: result.msg,
                                image: '../../images/warning.png'
                            })
                        }
                    }

                }
            })
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})