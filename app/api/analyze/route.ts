import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "没有收到图片" }, { status: 400 });
    }

    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        model: "Qwen/Qwen3-VL-32B-Instruct",
        max_tokens: 2000,
        enable_thinking: false,
        messages: [
          {
            role: "system",
            content: `你是一位专业的AI形象顾问，擅长分析东亚女性面部特征并给出风格建议。

【重要】你必须严格按照以下JSON格式输出，不得输出任何其他内容，不得有任何前缀、后缀、解释或思考过程。所有字段必须完整填写，不得省略任何字段。

{
  "styleType": "风格类型名称（如：清冷少女、知性优雅、甜美活力、御姐气场、温柔仙气、复古文艺）",
  "keywords": ["气质词1", "气质词2", "气质词3"],
  "description": "100字左右的风格描述，语气像朋友聊天，温暖有共鸣",
  "faceType": "脸型类型，如：鹅蛋脸、心形脸、圆脸、方脸、长脸等",
  "faceFeatures": ["面部特征标签1", "面部特征标签2", "面部特征标签3"],
  "faceDescription": "30字左右，描述脸型气质特点",
  "hairRecommend": {
    "best": { "name": "最推荐发型名称", "reasons": ["推荐理由1", "推荐理由2", "推荐理由3"] },
    "good": ["推荐发型1", "推荐发型2", "推荐发型3", "推荐发型4"],
    "notGood": ["不推荐发型1", "不推荐发型2", "不推荐发型3", "不推荐发型4"]
  },
  "makeupDetail": {
    "eye": "眼妆建议，20字左右",
    "blush": "腮红建议，20字左右",
    "lip": "唇妆建议，20字左右",
    "base": "底妆建议，20字左右",
    "nose": "鼻影建议，20字左右"
  },
  "makeupPoints": ["妆容要点1", "妆容要点2", "妆容要点3"],
  "colorPalette": {
    "eyeshadow": ["颜色名1", "颜色名2"],
    "blush": ["颜色名1", "颜色名2"],
    "lip": ["颜色名1", "颜色名2"]
  }
}`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image.replace(/^data:image\/\w+;base64,/, "")}`,
                },
              },
              {
                type: "text",
                text: "请分析这张照片中人物的面部特征，给出专属风格档案。直接输出JSON，不要有任何其他内容。",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("硅基流动 API 错误：", err);
      return NextResponse.json(
        { error: "AI 分析失败，请稍后重试" },
        { status: 500 }
      );
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? "";

    console.log("AI 原始返回：", content.slice(0, 200));

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("未找到JSON，原始内容：", content);
      return NextResponse.json(
        { error: "AI 返回格式有误，请重试" },
        { status: 500 }
      );
    }

    const result = JSON.parse(jsonMatch[0]);

    // 兜底：确保所有字段存在
    const safe = {
      styleType: result.styleType ?? "清冷少女",
      keywords: result.keywords ?? ["清透", "纯净", "自然"],
      description: result.description ?? "五官精致，气质出众。",
      faceType: result.faceType ?? "鹅蛋脸",
      faceFeatures: result.faceFeatures ?? ["五官精致", "肤色均匀", "轮廓柔和"],
      faceDescription: result.faceDescription ?? "脸型流畅柔和，五官分布均匀。",
      hairRecommend: {
        best: {
          name: result.hairRecommend?.best?.name ?? "中长微卷发",
          reasons: result.hairRecommend?.best?.reasons ?? ["修饰脸型", "随性慵懒", "提升氛围感"],
        },
        good: result.hairRecommend?.good ?? ["齐肩直发", "空气刘海中长发", "低马尾", "侧分长发"],
        notGood: result.hairRecommend?.notGood ?? ["厚重齐刘海", "超短发", "大波浪卷", "高耸丸子头"],
      },
      makeupDetail: {
        eye: result.makeupDetail?.eye ?? "强调眼线和睫毛，突出深邃感",
        blush: result.makeupDetail?.blush ?? "用浅粉色扫在颧骨上方",
        lip: result.makeupDetail?.lip ?? "选择豆沙色或裸粉色哑光唇膏",
        base: result.makeupDetail?.base ?? "底妆清透服帖，打造无暇光泽肌",
        nose: result.makeupDetail?.nose ?? "轻微鼻影修饰山根，使轮廓更立体",
      },
      makeupPoints: result.makeupPoints ?? ["粉系色彩统一整体感", "卧蚕妆打造水润眼神", "避免哑光保留光泽感"],
      colorPalette: {
        eyeshadow: result.colorPalette?.eyeshadow ?? ["奶茶棕", "杏粉"],
        blush: result.colorPalette?.blush ?? ["杏粉", "浅粉"],
        lip: result.colorPalette?.lip ?? ["豆沙", "裸粉"],
      },
    };

    return NextResponse.json(safe);
  } catch (err) {
    console.error("服务器错误：", err);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}