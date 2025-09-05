import { View, Text, Pressable } from 'react-native';
import { s } from '../../screens/equip.styles';

const TagsBar = ({ tags, active, onToggle }) => (
  <View style={s.tagsWrap}>
    {tags.map(t => {
      const on = active.includes(t);
      return (
        <Pressable key={t} style={[s.chip, on && s.chipSel]} onPress={() => onToggle(t, on)}>
          <Text style={[s.chipText, on && s.chipTextSel]}>{t}</Text>
        </Pressable>
      );
    })}
  </View>
);

export default TagsBar;
