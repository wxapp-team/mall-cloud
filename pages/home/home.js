var config = require("../../utils/config.js");
var template = require("../common/templeates.js");
var util = require('../../utils/util.js');
var app = getApp();
Page({
    data: {
      
        pageIndex: 1,
        pageSize: 10,
        isDataEnd: false,
        noTimeData:false,
        loading: false,
        choiceProducts: [],
        refreshSuccess: true,
        NowTime: "",
        timeGoData: [],
        pinGoData:[],
        keyword: "",
        TopicUrl: "",
        VersionNumber: "",
        TopicData: null,
        RequestUrl: app.getRequestUrl,
        CurrentProduct: null, //当前商品信息
        CurrentSku: null,
        selectedSkuContent: null,
        isShowSkuSelectBox: false,
        TotalNum: 0,
        gotopVal: true,
        pageLoaded: false
    },
    onShow: function() {
        this.GetShopCart();
    },
    GetShopCart: function() {
        var that = this,
            totalnum = 0,
            tempshopcart = that.data.choiceProducts;
        app.getOpenId(function (openid) {
            wx.request({
                url: app.getUrl("Cart/GetCartProduct"),
                data: {
                    openId: openid
                },
                success: function(result) {
                    result = result.data;
                    if (result.success) {

                        var shopcarttemp = result.data.Shop;
                        var changeshopcart = {};
                        shopcarttemp.forEach(function(cartitem, index, array) {
                            cartitem.forEach(function(item, idx, arr) {
                                if (item.IsValid) {
                                    if (changeshopcart[item.Id] != undefined) {
                                        changeshopcart[item.Id] = parseInt(changeshopcart[item.Id]) + parseInt(item.Count);
                                    } else {
                                        changeshopcart[item.Id] = item.Count;
                                    }
                                    totalnum += parseInt(item.Count);
                                }
                            });
                        });
                        tempshopcart.forEach(function(item, index, array) {
                            if (changeshopcart[item.ProductId] != undefined) {
                                item.CartQuantity = parseInt(changeshopcart[item.ProductId]);
                            } else {
                                item.CartQuantity = 0;
                            }
                        });

                    } else if (result.code == '502') {
                        //wx.redirectTo({
                        //  url: '../login/login'
                        //})
                    } else {
                        app.showErrorModal(result.msg, function(res) {
                            if (res.confirm) {
                                wx.navigateBack({
                                    delta: 1
                                })
                            }
                        });
                    }
                },
                complete: function() {
                    wx.hideLoading();
                    if (tempshopcart != null) {
                        that.setData({
                            choiceProducts: tempshopcart,
                            TotalNum: totalnum
                        });
                    }
                }
            })
        },'home');
    },
    onShareAppMessage: function() {
        return {
            title: '首页',
            path: '',
            success: function(res) {},
            fail: function(res) {
                // 转发失败
            }
        }

    },
    toTimeGo:function(e){
      wx.navigateTo({
        url: '../countdowndetail/countdowndetail?id=' + e.currentTarget.dataset.id
      })
    },
  toPinGo: function (e) {
    wx.navigateTo({
      url: '../groupproduct/groupproduct?id=' + e.currentTarget.dataset.id,
    })
  },
    getHomeData: function(res) {
        var that = this;
        if (res.code == '502') {
            wx.navigateTo({
                url: '../login/login'
            });
            return;
        }
        if (res.success) {
          that.getHomeProductData(that.data.pageIndex, true);
          that.GetIndexPinGoData(1, false);
          that.getTimeType(1);
          
          
            that.setData({
                refreshSuccess: true,
                imageList: res.data.ImgList || [],
                countDownList: res.data.CountDownList || [],
                TopicUrl: res.data.HomeTopicPath,
                VersionNumber: res.data.Vid
            });
            app.globalData.QQMapKey = res.data.QQMapKey; //获取QQ地图密钥
            that.CheckVersionNumber(that);
        } else {
            wx.showToast({
                title: '系统数据异常',
            })
        }
        wx.hideNavigationBarLoading();
    },
    //获取限时最新数据
    getTimeType:function(){
      const that = this;
      wx.showNavigationBarLoading();
      wx.request({
        url: app.getUrl(app.globalData.GetLimitBuyListSpan),
        data: {},
        success: function (result) {
          var type=null;
          if (result.data.success) {
            var tabnav=result.data.data
            for (let i = 0; i < tabnav.length; i++) {
              if (tabnav[i].selected) {
                   type=tabnav[i].type
              }
            }
            that.getLimitBuyList(1, type);
          }
        },
        complete: function () {
          wx.hideNavigationBarLoading();
        }
      });
    },
    // 获取首页限时数据
  getLimitBuyList: function (pageIndex,type){
    var that = this;
    if (pageIndex < 1) pageIndex = 1;
    wx.request({
      url: app.getUrl(app.globalData.GetLimitBuyListByType),
      data: {
        pageIndex: pageIndex,
        pageSize: 12,
        type:type
      },
      success: function (result) {
        if (result.data.data.length){
          that.setData({
            noTimeData: true//有限时抢购列表时，显示限时
          })
        }
        that.setData({
          timeGoData:result.data.data
        })
      }});
  },
  // 获取首页拼团数据
  GetIndexPinGoData: function (pageIndex) {
    var that = this;
    if (pageIndex < 1) pageIndex = 1;
    wx.request({
      url: app.getUrl(app.globalData.GetIndexPinGoData),
      data: {
        pageNo: pageIndex,
        pageSize:10,
        openId: app.globalData.openId
      },
      success: function (result) {
        // console.log(result.data.data.rows);
        that.setData({
          pinGoData: result.data.data.rows
        })
      }
    });
  },
    getHomeProductData: function(pageIndex, addPageIndex) {
        var that = this;
        if (addPageIndex == undefined) {
            addPageIndex = false;
        }
        if (pageIndex < 1) pageIndex = 1;

        if (that.data.isDataEnd || that.data.loading) {
            return;
        }
        that.setData({
            loading: true
        });

        var parameters = {
            openId: app.globalData.openId,
            pageIndex: pageIndex,
            pageSize: that.data.pageSize
        }
        wx.showLoading({
            title: "商品信息加载中..."
        });
        config.httpGet(app.getUrl(app.globalData.GetIndexProductData), parameters, function(res) {
            that.setData({
                loading: false
            });
            if (res.success) {
                var choiceProducts = that.data.choiceProducts;
                if (res.data.length > 0) {
                    for (var i in res.data) {
                        var prodata = res.data[i];
                        choiceProducts.push(prodata);
                    }
                    var newdata = {
                        choiceProducts: choiceProducts
                    };
                    if (!res.data || res.data.length < that.data.pageSize) {
                        newdata.isDataEnd = true;
                    }
                    if (addPageIndex) {
                        newdata.pageIndex = pageIndex + 1;
                    }
                    that.setData(newdata);
                }
            }
            wx.hideLoading();
        });
    },
    onLoad: function(options) {
      // 跳转到具体分享页
      console.log(2222222, decodeURIComponent(options.sharePage))
      if (options.sharePage) {
        wx.navigateTo({
          url: decodeURIComponent(options.sharePage),
        })
      }
        // 生命周期函数--监听页面加载
      var that = this;
        var date=new Date();
      var hour = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
      var minute = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
      var second = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
        this.setData({
          NowTime:{
            hour: hour, minute: minute, second: second
          } 
        })
       
        setInterval(function(){
          var date = new Date();
          var hour = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
          var minute = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
          var second = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();
          that.setData({
            NowTime: {
              hour: hour, minute: minute, second: second
            }
          })
        },1000);
    
        wx.showNavigationBarLoading();
        config.httpGet(app.getUrl(app.globalData.getIndexData), { openId: app.globalData.openId}, that.getHomeData);

        var distributorId = options.distributorId || wx.getStorageSync("distributorId"),
            userInfo = wx.getStorageSync('userInfo');
        if (userInfo && userInfo.IsDistributor){
            distributorId = userInfo.UserId;
        }
        if (distributorId) {
            that.getShopHeader(distributorId);
            wx.setStorageSync("distributorId", distributorId);
        }
    },
    getShopHeader: function(distributorId) {
        var that = this;
        config.httpGet(app.getUrl(app.globalData.getShopHeader), {
            distributorId: distributorId,
            openId: app.globalData.openId
        }, function(res) {
            if (res.success) {
                that.setData({
                    shopHeaderInfo: res.data
                });
                wx.setNavigationBarTitle({
                    title: res.data.ShopName
                })
            } else { 
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 2000,
                    mask: true,
                });
            }
        })
    },

    ClickSwiper: function (e) {
       
        var urllink = e.currentTarget.dataset.link,
            showtype = e.currentTarget.dataset.showtype;
        template.JumpUrlByType(app, config, showtype, urllink);
    },

    CheckVersionNumber: function(that) {
        that.DownloadTopcis(that);
    },
    DownloadTopcis: function(that) { //保存数据
        wx.request({
            url: that.data.TopicUrl,
            dataType: 'json',
            success: function(res) {
                wx.setStorage({
                    key: 'topiclist',
                    data: res.data.LModules,
                });
              // for (let i = 0; i < res.data.LModules.length;i++){
              //   if (res.data.LModules[i].)
              // }
            },
            complete: function() {
                that.HomeTopicData(that);
            }
        })
    },
    HomeTopicData: function(that) {
        wx.getStorage({
            key: 'topiclist',
            success: function(res) {
                that.setData({
                    TopicData: res.data,
                    pageLoaded: true
                });
            },
            complete: function() {}
        })
    },
    bindSearchInput: function(e) {
        var keyword = e.detail.value;
        if (keyword.length > 0) {
            this.setData({
                keyword: keyword
            })
        }
    },

    bindConfirmSearchInput: function(e) {
        const keyword = e.detail.value;
        if (keyword.length > 0) {
            wx.setStorage({
                key: "keyword",
                data: keyword
            })
            wx.switchTab({
                url: "../searchresult/searchresult",
                success: function(res) {
                    wx.hideKeyboard()
                }
            })
        }
    },

    bindBlurInput: function(e) {
        wx.hideKeyboard()
    },

    bindSearchAction: function(e) {
        const keyword = this.data.keyword;
        if (keyword.length > 0) {
            wx.setStorage({
                key: "keyword",
                data: keyword
            })
            wx.switchTab({
                url: "../searchresult/searchresult",
                success: function(res) {
                    wx.hideKeyboard()
                }
            })
        }
    },
    gotoKeyWordPage: function(e) {
        wx.navigateTo({
            url: '../search/search'
        })
    },
    findProductById: function(id) {
        var _pro = this.data.choiceProducts.find(function(d) {
            return d.ProductId == id;
        });
        return _pro;
    },
    setProductCartQuantity: function(id, num, operator) { //修改商品购物车中存在数量
        var that = this,
            hasEdit = false,
            _Products = that.data.choiceProducts,
            _pro = _Products.find(function(d) {
                return d.ProductId == id;
            });
        if (_pro) {
            num = parseInt(num);
            switch (operator) {
                case "=":
                    _pro.CartQuantity = num;
                    break;
                case "+":
                    _pro.CartQuantity += num;
                    break;
            }
            if (_pro.CartQuantity < 0) {
                _pro.CartQuantity = 0;
            }
            hasEdit = true;
        }
        if (hasEdit) {
            var newdata = {
                choiceProducts: _Products
            };
            that.setData(newdata);
        }
    },
    setSkuCartQuantity: function(skuId, num, operator, price, isOpenLadder) {
        //修改商品失规格购物车中存在数量,只能操作this.data.CurrentProduct中的规格
        var that = this,
            hasEdit = false,
            _curProduct = that.data.skuData;

        if (_curProduct) {
            var _cursku = that.data.curSkuData;
            if (_cursku) {
                num = parseInt(num);
                switch (operator) {
                    case "=":
                        _cursku.CartQuantity = num;
                        break;
                    case "+":
                        _cursku.CartQuantity += num;
                        break;
                }
                if (_cursku.CartQuantity < 0) {
                    _cursku.CartQuantity = 0;
                }
                if (isOpenLadder) {
                    _cursku.SalePrice = price;
                }
                hasEdit = true;
            }
        }
        if (hasEdit) {
            that.data.skuData.Skus[that.data.curSkuData.SkuId] = that.data.curSkuData;
            that.setData({
                curSkuData: that.data.curSkuData,
                skuData: that.data.skuData
            });
        }
    },
    catchAddCart: function(e) {
        var that = this,
            _domThis = e.currentTarget.dataset,
            curProId = _domThis.productid,
            activeid = _domThis.activeid,
            activetype = _domThis.activetype,
            url = '';
        if (activetype == 1) {
            wx.navigateTo({
                url: '../countdowndetail/countdowndetail?id=' + activeid
            });
            return;
        }


        var curOP = _domThis.operator;
        var num = parseInt(curOP + "1");
        var opensku = _domThis.opensku + '';
        var _pro = that.findProductById(curProId);
        if (!_pro.HasSKU || (_pro.HasSKU && opensku == "false")) {
            if (that.data.curSkuData && that.data.curSkuData.Stock == 0) {
                app.showErrorModal('当前所选规格库存为0');
                return;
            }
            if (!_pro.HasSKU && _pro.Stock == 0) {
                app.showErrorModal('该商品库存为0');
                return;
            }
            var curSku = _domThis.sku;
            that.addToCart(curProId, curSku, num);
        } else {
            wx.showLoading();
            app.getOpenId(function(openid) {
                wx.request({
                    url: app.getUrl("product/GetProductSkus"),
                    data: {
                        ProductId: curProId,
                        openId: openid,
                    },
                    success: function(res) {
                        wx.hideLoading();
                        res = res.data;
                        if (res.success) {
                            res = res.data;
                            if (res.Stock == 0) {
                                wx.showToast({
                                    title: '此商品已售罄',
                                });
                                return;
                            }
                            var newSku = {},
                                enabledSku;
                            res.Skus.forEach(function(item) {
                                newSku[item.SkuId] = item;
                                if (!enabledSku && item.Stock) {
                                    enabledSku = item;
                                }
                            });
                            res.Skus = newSku;
                            if (!res.DefaultSku.Stock) {
                                //设置默认选择为有库存sku组合
                                res.DefaultSku = enabledSku;
                            }
                            that.setData({
                                chooseSkuHide: false,
                                skuData: res,
                                skuArr: res.DefaultSku.SkuId.split('_'),
                                curSkuData: res.DefaultSku
                            });

                            that.setDisabledSku(0);

                            that.showSkuDOM();
                        }
                    },
                    complete: function() {}
                });
            });
        }
    },
    setDisabledSku: function(index) {
        //选择某个sku自动组合下一组规格可能组合，判断库存为零的的不可选
        var that = this,
            SkuItems = that.data.skuData.SkuItems,
            Skus = that.data.skuData.Skus,
            len = SkuItems.length,
            skuArr = that.data.skuArr,
            nextIndex;
        if (len > 1) {
            nextIndex = index == len - 1 ? 0 : index + 1;
        } else {
            nextIndex = 0;
        }

        SkuItems[nextIndex].AttributeValue.forEach(function(item) {
            var tempArr = JSON.parse(JSON.stringify(skuArr));
            tempArr[SkuItems[nextIndex].AttributeIndex + 1] = item.ValueId;
            if (!Skus[tempArr.join('_')].Stock) {
                item.disabled = true;
            } else {
                item.disabled = false;
            }
        });
        that.setData({
            skuData: that.data.skuData
        });
    },
    swithSku: function(e) {
        var index = e.target.dataset.index,
            parentindex = e.target.dataset.parentindex;
        this.data.skuArr[index + 1] = e.target.dataset.id;
        this.setData({
            skuArr: this.data.skuArr,
            curSkuData: this.data.skuData.Skus[this.data.skuArr.join('_')]
        });
        this.setDisabledSku(parentindex);
    },
    addToCart: function(id, skuId, quantity) {
        var that = this;
        app.getOpenId(function(openid) {
            wx.request({
                url: app.getUrl(app.globalData.getUpdateToCart),
                data: {
                    openId: openid,
                    SkuID: skuId,
                    Quantity: quantity,
                    GiftID: 0
                },
                success: function(result) {
                    result = result.data;
                    if (result.success) {
                        that.setProductCartQuantity(id, quantity, "+");
                        that.setSkuCartQuantity(skuId, quantity, "+", result.data.Price, result.data.IsOpenLadder);
                    } else {
                        if (result.code == '502') {
                            wx.navigateTo({
                                url: '../login/login'
                            })
                        } else {
                            app.showErrorModal(result.msg);
                        }
                    }
                },
                complete: function() {
                    var totalnum = parseInt(that.data.TotalNum);
                    that.setData({
                        TotalNum: totalnum + parseInt(quantity)
                    });
                }
            });
        });
    },
    hideSkuDOM: function() {
        this.setData({
            isShowSkuSelectBox: false,
        });
    },
    showSkuDOM: function() {
        this.setData({
            isShowSkuSelectBox: true,
        });
    },
    bindCountDownTap: function(e) {
        var countdownid = e.currentTarget.dataset.countdownid;
        wx.navigateTo({
            url: '../countdowndetail/countdowndetail?id=' + countdownid
        })
    },

    bindGoodsTap: function(e) {
        var productid = e.currentTarget.dataset.productid,
            activeid = e.currentTarget.dataset.activeid,
            activetype = e.currentTarget.dataset.activetype,
            toUrl = '../productdetail/productdetail?id=' + productid;
        if (activetype == 1)
            toUrl = '../countdowndetail/countdowndetail?id=' + activeid;

        wx.navigateTo({
            url: toUrl,
        })
    },
    goTop: function(e) {
        this.setData({
            scrollTop: 0
        })
    },
    scroll: function(e) {
        this.setData({
            gotopVal: e.detail.scrollTop < 350
        });
    },
    loadMoreProduct: function() {
        var that = this;
        var refreshSuccess = that.data.refreshSuccess;
        if (refreshSuccess == true) {
            var pageIndex = that.data.pageIndex;
            that.getHomeProductData(pageIndex, true);
        }
    },
    onReachBottom: function() {
        // 页面上拉触底事件的处理函数
    }
})