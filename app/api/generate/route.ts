import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, prompt } = await req.json();

    if (!image || !prompt) {
      return NextResponse.json({ error: "缺少图片或提示词" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "图片生成失败，请重试" }, { status: 500 });
    }

    const data = await response.json() as { images?: { url: string }[] };
    const imageUrl = data.images?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ error: "未能获取生成图片" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error("服务器错误：", err);
    return NextResponse.json({ error: "服务器错误，请稍后重试" }, { status: 500 });
  }
}