// components/Liste.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import Subtitle from './Subtitle';
import theme from '../styles/theme';

interface ListeItemProps {
  title: string;
  content?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

const ListeItem: React.FC<ListeItemProps> = ({
  title,
  content,
  onEdit,
  onDelete,
  editLabel = '📝',
  deleteLabel = '❌',
}) => {
  return (
    <View style={styles.container}>
      <Subtitle>{title}</Subtitle>
      {content && (
        <View style={styles.contentContainer}>
          {typeof content === 'string' ? (
            <Text style={styles.content}>{content}</Text>
          ) : (
            content
          )}
        </View>
      )}
      <View style={styles.buttonsContainer}>
        {onEdit && <Button title={editLabel} onPress={onEdit} variant="horizontal" />}
        {onDelete && <Button title={deleteLabel} onPress={onDelete} variant="horizontal" />}
      </View>
    </View>
  );
};

export default ListeItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  contentContainer: {
    marginVertical: 8,
  },
  content: {
    fontSize: 14,
    color: theme.colors.text,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
});
