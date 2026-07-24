"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import {
  type MetaEventName,
  type MetaEventParameters,
  trackMetaEvent,
} from "./meta-pixel";

type MetaTrackedLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "onClick"
> & {
  children: ReactNode;
  metaEvent: MetaEventName;
  metaParameters?: MetaEventParameters;
  secondaryMetaEvent?: MetaEventName;
  secondaryMetaParameters?: MetaEventParameters;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function MetaTrackedLink({
  children,
  metaEvent,
  metaParameters,
  secondaryMetaEvent,
  secondaryMetaParameters,
  onClick,
  ...anchorProps
}: MetaTrackedLinkProps) {
  return (
    <a
      {...anchorProps}
      onClick={(event) => {
        trackMetaEvent(metaEvent, metaParameters);
        if (secondaryMetaEvent) {
          trackMetaEvent(secondaryMetaEvent, secondaryMetaParameters);
        }
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
