var test = require("test");
test.setup();


describe('synchronous backends', function() {
	it('htmlClean', function() {
		var htmlUtil = require("../utils/index");

		var a = "想看看一副手工眼镜框是怎么做出来的？趁星期天有空，做一副，发个过程图。<br><br><br>第一步，你需要一张设计图，下面这张是眼镜的模板，这个很重要，涉及到佩戴的舒适性。这张图是我做了12副镜框统计数据画出来的。<br><br><div class=\"pic_src_wrapper\"><img pic_type=\"2\" class=\"BDE_Image\" src=\"http://imgsrc.baidu.com/forum/w%3D580/sign=b7e4babb1e30e924cfa49c397c096e66/f7784510b912c8fc7322517efd039245d48821a7.jpg\" width=\"560\" height=\"420\" changedsize=\"true\"><span class=\"apc_src_wrapper\">图片来自：<a href=\"http://jump.bdimg.com/safecheck/index?url=x+Z5mMbGPAs6STQlwEA0OC941mwgc1i+hganh2xZUhgMoS+dNxst5v7THYeoCy+JPgl8wqttOvqhkwplyroR0PmYdgaWCo0+6OFH0zkSeJJLJICpHcIR1B+FclcDo4Zm0b9PZ2GbwglU4n0L0Mfar8hMZgfTf+uS\"  target=\"_blank\">qyf154469300的百度相册</a></span></div>第二步，选材，这次就用黑檀，镜框和镜腿都用黑檀，过去有用紫罗兰木，花梨木做，现在基本用黑檀，下次试一试绿檀木。材料尺寸，15*1.5*6<br><div class=\"pic_src_wrapper\"><img pic_type=\"2\" class=\"BDE_Image\" src=\"http://imgsrc.baidu.com/forum/w%3D580/sign=addc7ba7b999a9013b355b3e2d940a58/3ce1cafcc3cec3fd4eef00c6d788d43f859427a7.jpg\" width=\"560\" height=\"420\" changedsize=\"true\"><span class=\"apc_src_wrapper\">图片来自：<a href=\"http://jump.bdimg.com/safecheck/index?url=x+Z5mMbGPAs6STQlwEA0OC941mwgc1i+hganh2xZUhgMoS+dNxst5v7THYeoCy+JPgl8wqttOvqhkwplyroR0PmYdgaWCo0+6OFH0zkSeJJLJICpHcIR1B+FclcDo4Zm0b9PZ2GbwglU4n0L0Mfar8hMZgfTf+uS\"  target=\"_blank\">qyf154469300的百度相册</a></span></div>";

		var _a = "想看看一副手工眼镜框是怎么做出来的？趁星期天有空，做一副，发个过程图。\n\n第一步，你需要一张设计图，下面这张是眼镜的模板，这个很重要，涉及到佩戴的舒适性。这张图是我做了12副镜框统计数据画出来的。\n\n图片来自：qyf154469300的百度相册\n第二步，选材，这次就用黑檀，镜框和镜腿都用黑檀，过去有用紫罗兰木，花梨木做，现在基本用黑檀，下次试一试绿檀木。材料尺寸，15*1.5*6\n图片来自：qyf154469300的百度相册";
		assert.equal(htmlUtil.fromHtml(a), _a);
	})
})

test.run(console.DEBUG);