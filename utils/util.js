function formatTime(date) {
  if (date == undefined) {
    return;
  }
  if (date == "") {
    return;
  }
  date = date.replace(/(\d{4})-(\d{2})-(\d{2})T(.*)?\.(.*)/, "$1/$2/$3 $4");
  date = new Date(date);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  return (
    [year, month, day].map(formatNumber).join("-") +
    " " +
    [hour, minute, second].map(formatNumber).join(":")
  );
}

function formatNumber(n) {
  n = n.toString();
  return n[1] ? n : "0" + n;
}

function json2Form(json) {
  var str = [];
  for (var p in json) {
    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  return str.join("&");
}

// 海报分享
function createdShareImg(detail, flag) {
  var ctx = wx.createCanvasContext("sharePoster");
  var name = detail.name;
  var cover = detail.cover;
  var coverWidth = detail.coverWidth;
  var coverHeight = detail.coverHeight;
  let pichName = detail.pichName;
  var price = detail.price;
  var maxPrice = detail.maxPrice;
  var avatar = detail.avatar;
  var qrcode = detail.qrcode;
  // 昵称
  if (pichName.length > 16) {
    pichName = pichName.slice(0, 9) + "...";
  }
  ctx.save();
  ctx.drawImage('../../images/canvas-bg.jpg', 0, 0, 286, 480);

  // 头像和昵称
  ctx.arc(36, 40, 20, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(avatar, 16, 20, 40, 44);
  ctx.restore();
  ctx.font = "normal normal 14px sans-serif";
  ctx.setTextAlign("left");
  ctx.setFillStyle("#000");
  ctx.fillText(pichName, 70, 35);
  ctx.setFontSize(12);
  ctx.setFillStyle("#aaa");
  ctx.fillText("为您推荐好货好物~~", 70, 55);
  ctx.setFillStyle("#000");
  // 分享种类
  if (flag === 'pintuan') {
    ctx.fillText("拼团", 240, 35);
  } else if (flag === 'xianshigou') {
    ctx.setFillStyle("#aaa");
    ctx.fillText("限时购", 220, 35);
    ctx.setFillStyle("#000");
  }
  // 封面图
  ctx.drawImage(
    cover,
    0,
    (coverHeight - (252 * coverWidth) / 252) / 2,
    coverWidth,
    (252 * coverWidth) / 252,
    16,
    60,
    252,
    252
  );

  // 标题
  ctx.font = "normal bold 14px sans-serif";
  ctx.setTextAlign("left");
  var nameWidth = ctx.measureText(name).width;
  // 包邮
  ctx.setStrokeStyle("#fb1438");
  ctx.setFillStyle("#fb1438");
  ctx.font = "normal normal 12px sans-serif";
  ctx.strokeRect(16, 285, 30, 20);
  ctx.fillText("包邮", 19, 298);
  ctx.strokeRect(50, 285, 30, 20);
  ctx.fillText("包税", 53, 298);
  // 标题换行
  ctx.font = "normal bold 14px sans-serif";
  ctx.setFillStyle("#000");
  wordsWrap(ctx, name, nameWidth, 252, 16, 322, 16);
  // 计算标题所占高度
  var titleHight = Math.ceil(nameWidth / 252) * 16;
  // 价格描述
  ctx.setFillStyle("#333333");
  ctx.fillText("限时折扣价", 30, 336 + titleHight);
  ctx.setFillStyle("#fb1438");
  ctx.setFontSize(12);
  ctx.fillText("￥", 100, 336 + titleHight);
  ctx.setFontSize(30);
  ctx.fillText(price, 110, 340 + titleHight);
  ctx.setFillStyle("#aaa");
  ctx.font = "normal normal 12px sans-serif";
  ctx.fillText("活动结束价 ￥" + maxPrice, 30, 366 + titleHight);
  // 二维码图片
  ctx.drawImage(qrcode, 190, 330, 60, 60);
  ctx.setFillStyle("#aaa");
  ctx.fillText("长按或扫码购买", 180, 400);

  ctx.draw();
}

// 标题超出换行处理
function wordsWrap(ctx, name, nameWidth, maxWidth, startX, srartY, wordsHight) {
  let lineWidth = 0;
  let lastSubStrIndex = 0;
  for (let i = 0; i < name.length; i++) {
    lineWidth += ctx.measureText(name[i]).width;
    if (lineWidth > maxWidth) {
      ctx.fillText(name.substring(lastSubStrIndex, i), startX, srartY);
      srartY += wordsHight;
      lineWidth = 0;
      lastSubStrIndex = i;
    }
    if (i == name.length - 1) {
      ctx.fillText(name.substring(lastSubStrIndex, i + 1), startX, srartY);
    }
  }
}

function saveShareImg(shareImg) {
  let that = this;
  wx.getSetting({
    success(res) {
      if (!res.authSetting["scope.writePhotosAlbum"]) {
        wx.authorize({
          scope: "scope.writePhotosAlbum",
          success() {
            wx.saveImageToPhotosAlbum({
              filePath: shareImg,
              success() {
                wx.showToast({
                  title: "保存成功"
                });
              },
              fail() {
                wx.showToast({
                  title: "保存失败",
                  icon: "none"
                });
              }
            });
          },
          fail() {
            // that.setData({
            //   openSet: true
            // });
          }
        });
      } else {
        wx.saveImageToPhotosAlbum({
          filePath: shareImg,
          success() {
            wx.showToast({
              title: "保存成功"
            });
          },
          fail() {
            wx.showToast({
              title: "保存失败",
              icon: "none"
            });
          }
        });
      }
    }
  });
}

module.exports = {
  formatTime: formatTime,
  json2Form: json2Form,
  createdShareImg: createdShareImg,
  saveShareImg: saveShareImg
};
