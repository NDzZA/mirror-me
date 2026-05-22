import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, style } = await req.json();

    if (!image || !style) {
      return NextResponse.json({ error: "缺少图片或风格参数" }, { status: 400 });
    }

    // 根据选择的风格生成不同的提示词
    const stylePrompts: Record<string, string> = {
        korean: "这是一张真实人物照片。请保持照片的真实感和照片质感，保持人物的脸型、五官、肤色、皮肤纹理完全不变，仅在脸上添加韩系清透妆容：轻薄底妆保留原有肤质、棕色内眼线眼尾自然拉长、卧蚕位置轻微提亮、眼下轻扫杏粉色腮红、豆沙色渐变晕染唇妆。效果要自然真实，像真人化了妆的照片，不要卡通化不要过度美颜",
        sweet: "这是一张真实人物照片。请保持照片的真实感和照片质感，保持人物的脸型、五官、肤色、皮肤纹理完全不变，仅在脸上添加甜美妆容：轻薄底妆、玫瑰粉唇色、眼下腮红晕染、卧蚕珠光提亮、纤长睫毛。效果要自然真实，像真人化了妆的照片，不要卡通化不要过度美颜",
        vintage: "这是一张真实人物照片。请保持照片的真实感和照片质感，保持人物的脸型、五官、肤色、皮肤纹理完全不变，仅在脸上添加复古妆容：哑光底妆、正红唇色饱和渐变、猫眼眼线、细长眉。效果要自然真实，像真人化了妆的照片，不要卡通化不要过度美颜",
        natural: "这是一张真实人物照片。请保持照片的真实感和照片质感，保持人物的脸型、五官、肤色、皮肤纹理完全不变，仅在脸上添加素颜妆：极轻薄透明底妆、润唇微光、轻薄腮红、自然眉形梳理整齐。效果要极度自然真实，像素颜略施粉黛，不要卡通化不要过度美颜",
        hair_wave: "这是一张真实人物照片。请保持照片的真实感，保持人物的脸型五官妆容肤色完全不变，仅将发型改为韩系中长卷发大波浪，发色改为自然黑茶色，八字空气感刘海。发丝要有真实质感，像真实发型照片，不要卡通化",
        hair_bob: "这是一张真实人物照片。请保持照片的真实感，保持人物的脸型五官妆容肤色完全不变，仅将发型改为锁骨长度内扣波波头，有层次感，发色改为黑茶色。发丝要有真实质感，像真实发型照片，不要卡通化",
        hair_long: "这是一张真实人物照片。请保持照片的真实感，保持人物的脸型五官妆容肤色完全不变，仅将发型改为长直发，发色自然黑，中分八字刘海。发丝要有真实质感，像真实发型照片，不要卡通化",
        hair_short: "这是一张真实人物照片。请保持照片的真实感，保持人物的脸型五官妆容肤色完全不变，仅将发型改为短发蓬松wolf cut层次感，深棕色。发丝要有真实质感，像真实发型照片，不要卡通化",
      };

    const prompt = stylePrompts[style] ?? "保持人物脸型和五官不变，为人物化上自然妆容";

    const response = await fetch("https://api.siliconflow.cn/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        model: "Qwen/Qwen-Image-Edit-2509",
        prompt,
        image,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("图片生成错误：", err);
      return NextResponse.json(
        { error: "试妆生成失败，请重试" },
        { status: 500 }
      );
    }

    const data = await response.json() as { images?: { url: string }[] };
    const imageUrl = data.images?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: "未能获取生成图片" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("服务器错误：", err);
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}