import React from 'react';
import type { ComponentProps } from 'react';

import { Card as PaperCard } from 'react-native-paper';

import { FORM_FIELD, FORM_FIELD_PAPER_THEME } from '~/constants/formField';

export type PaperCardProps = ComponentProps<typeof PaperCard>;

interface CardComponent extends React.FC<PaperCardProps> {
  Actions: typeof PaperCard.Actions;
  Content: typeof PaperCard.Content;
  Cover: typeof PaperCard.Cover;
  Title: typeof PaperCard.Title;
}

export const CardBase: React.FC<PaperCardProps> = ({ children, style, ...rest }) => {
  return (
    <PaperCard
      theme={FORM_FIELD_PAPER_THEME}
      style={[{ backgroundColor: FORM_FIELD.background }, style]}
      {...rest}
    >
      {children}
    </PaperCard>
  );
};

export const Card = CardBase as CardComponent;
Card.Actions = PaperCard.Actions;
Card.Content = PaperCard.Content;
Card.Cover = PaperCard.Cover;
Card.Title = PaperCard.Title;
