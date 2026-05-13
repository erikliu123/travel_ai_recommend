import { ExternalLink, MapPin, Calendar } from 'lucide-react';

interface Guide {
  id: string;
  city: string;
  title: string;
  url: string;
  icon: string;
  description: string;
}

const guides: Guide[] = [
  {
    id: 'yangzhou',
    city: '扬州',
    title: '扬州二日游行程规划',
    url: 'https://cloud.iflow.cn/sites/Z0FBQUFBQnA0bmY4TFZ6QTZPaHlUeWEwS19wYnd3YzY0UEFNazY3R0w2UjJvaEFwUHpCQXI4SHJQTTRQMkJDTllTM3VjLUNQUnJycU40cFlJVlZvYnBGTTJEWnpQTy1nSi1IblFCa1pZaERxTzBFZWdsNDA0THpEbnRZUW9SdlktdGVKSGRYSHktcGM/%E6%89%AC%E5%B7%9E%E4%BA%8C%E6%97%A5%E6%B8%B8%E8%A1%8C%E7%A8%8B%E8%A7%84%E5%88%92.html#section-overview',
    icon: '🌸',
    description: '瘦西湖、个园、何园、东关街，经典两日游路线',
  },
  {
    id: 'dalian',
    city: '大连',
    title: '大连清明旅游攻略',
    url: 'https://cloud.iflow.cn/sites/Z0FBQUFBQnB5bDNQOXpKNnpaeC1icC05NXJxWGNFYy15MHJtTkdpM2ZSSktVN01nbzFQLVhCTDdKVGd5RTl0RkFXWEtybl84V2ZRR25saTJadG50RnNkUXNtZm5SRTVvRmRDa0RTRWI0dDE4anEtcnVFNUJLM2pkUHgyNnd3WGkwbXZCLUt2MjNhOWo/%E5%A4%A7%E8%BF%9E%E6%B8%85%E6%98%8E%E6%97%85%E6%B8%B8%E6%94%BB%E7%95%A5.html',
    icon: '🌊',
    description: '星海广场、老虎滩、金石滩，海滨城市清明出游指南',
  },
  {
    id: 'yunnan',
    city: '昆明+大理',
    title: '云南旅游规划',
    url: 'https://cloud.iflow.cn/sites/Z0FBQUFBQnBVUFNXdUkzWm1GLUNSejM0WTNhNkpIOGFkSlhHM3pQWGR3RG1vcWZSQ3ZJLUR1OEdzbGMwN3Ryd3dxdThudWMtdDJmNVY3dU9XOWxWZDdMcXhaVTZfTUZVaFp2eHpWUkhQVEVUTEFSYjlrNjQ5VUtEbmNYdFZMcV92QXZqN0FCSUQyWGs/%E4%BA%91%E5%8D%97%E6%97%85%E6%B8%B8%E8%A7%84%E5%88%92.html',
    icon: '🏔️',
    description: '春城昆明与风花雪月大理，经典云南线路',
  },
  {
    id: 'weihai',
    city: '威海',
    title: '威海旅游行程规划',
    url: 'https://cloud.iflow.cn/sites/Z0FBQUFBQm8xcGJfMnliUjNiQW1Zb0dHZkhJU3BVSU5wYXFpZFloTVlvZUpsQTFhNm5wU29VSU9iNVdIVVBITFFCQ1FFUVJBY2J4Rk9fWGhQeHpfRTViNV9VQ2E2WndUNXJlWHlRYTB4Y2tCSm1KVEdDZVA5LWlsdUVncWFPMzJEODVIT0tqM2RSR08/%E5%A8%81%E6%B5%B7%E6%97%85%E6%B8%B8%E8%A1%8C%E7%A8%8B%E8%A7%84%E5%88%92.html',
    icon: '🏖️',
    description: '刘公岛、成山头、国际海水浴场，胶东半岛海滨之旅',
  },
];

export default function AIGuides() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-2">2026 AI 旅游详细攻略</h1>
        <p className="text-muted-foreground text-sm sm:text-base">由 AI 生成的详细旅游行程规划，点击即可查看完整攻略</p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {guides.map((guide) => (
          <a
            key={guide.id}
            href={guide.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 sm:p-6 rounded-xl border border-border bg-background hover:border-blue-300 hover:shadow-lg smooth-transition"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl sm:text-5xl shrink-0">{guide.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                  <h3 className="text-lg sm:text-xl font-semibold font-serif group-hover:text-blue-600 smooth-transition truncate">
                    {guide.city}
                  </h3>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">{guide.title}</p>
                <p className="text-sm text-muted-foreground mb-3">{guide.description}</p>
                <div className="inline-flex items-center gap-1.5 text-sm text-blue-600 group-hover:text-blue-700">
                  <ExternalLink className="w-4 h-4" />
                  <span>查看完整攻略</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          使用提示
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 点击攻略卡片可跳转到详细的 AI 旅游规划页面</li>
          <li>• 攻略包含每日行程安排、景点推荐、交通指南等内容</li>
          <li>• 可在城市打卡时填入对应的 AI 攻略链接，方便后续回顾</li>
        </ul>
      </div>
    </div>
  );
}
