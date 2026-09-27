import {
  BalloonIcon,
  BlocksIcon,
  BriefcaseIcon,
  ChatIcon,
  CoinIcon,
  FamilyHeartIcon,
  HealthIcon,
  HeartIcon,
  HomeIcon,
  PinIcon,
  ScaleIcon,
  SupportIcon,
  UsersIcon,
} from "@/components/icons";
import type { GuideTopic } from "@/lib/city-guide";

export function TopicIcon({ topic, className }: { topic: GuideTopic; className?: string }) {
  switch (topic) {
    case "support": return <SupportIcon className={className} />;
    case "kids": return <BlocksIcon className={className} />;
    case "money": return <CoinIcon className={className} />;
    case "home": return <HomeIcon className={className} />;
    case "leisure": return <BalloonIcon className={className} />;
    case "meet": return <UsersIcon className={className} />;
    case "work": return <BriefcaseIcon className={className} />;
    case "law": return <ScaleIcon className={className} />;
    case "health": return <HealthIcon className={className} />;
    case "love": return <HeartIcon className={className} />;
    case "summary": return <ChatIcon className={className} />;
    case "city": return <PinIcon className={className} />;
    default: return <FamilyHeartIcon className={className} />;
  }
}
