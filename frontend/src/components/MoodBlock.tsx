import { Card } from '@/components/ui/card';
import type { MoodBlock as MoodBlockType } from '@/types';
import { motion } from 'framer-motion';

interface MoodBlockProps {
  moodBlock: MoodBlockType;
  onSelect: () => void;
}

const moodGradients: Record<string, string> = {
  chill: 'from-violet-twilight/40 to-indigo-velvet/40',
  focus: 'from-twilight-indigo/40 to-violet-twilight/40',
  'late-night': 'from-midnight/40 to-twilight-indigo/40',
  dreamy: 'from-lavender/40 to-soft-pink/40',
  peaceful: 'from-periwinkle/40 to-lavender/40',
  cozy: 'from-soft-pink/40 to-lavender/40',
};

export function MoodBlock({ moodBlock, onSelect }: MoodBlockProps) {
  const gradient = moodGradients[moodBlock.mood] || moodGradients.chill;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card
        className={`glass-card p-6 cursor-pointer hover:glow-soft transition-all bg-gradient-to-br ${gradient} border-2 border-periwinkle/20`}
        onClick={onSelect}
      >
        <h3 className="heading-md text-periwinkle mb-2">{moodBlock.title}</h3>
        <p className="body-sm text-lavender mb-3">{moodBlock.description}</p>
        <p className="body-sm text-soft-pink">{moodBlock.songs.length} songs</p>
      </Card>
    </motion.div>
  );
}