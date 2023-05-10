import {
  ANNOTATION_EDIT_URL,
  ANNOTATION_LOCATION,
  DEFAULT_NAMESPACE,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  HeaderIconLinkRow,
  IconLinkVerticalProps,
  InfoCardVariants,
  Link,
  // Link,
} from '@backstage/core-components';
import {
   alertApiRef, 
   useApi
  } from '@backstage/core-plugin-api';
import {
  ScmIntegrationIcon,
  scmIntegrationsApiRef,
} from '@backstage/integration-react';
import {
  catalogApiRef,
  getEntitySourceLocation,
  useEntity,
} from '@backstage/plugin-catalog-react';
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  makeStyles,
} from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';
import DocsIcon from '@material-ui/icons/Description';
import EditIcon from '@material-ui/icons/Edit';
import React, { useCallback } from 'react';
import { AboutContent } from './AboutContent';

const useStyles = makeStyles({
  gridItemCard: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 10px)', // for pages without content header
    marginBottom: '10px',
  },
  fullHeightCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  gridItemCardContent: {
    flex: 1,
  },
  fullHeightCardContent: {
    flex: 1,
  },
});

/**
 * Props for {@link EntityAboutCard}.
 *
 * @public
 */
export interface AboutCardProps {
  variant?: InfoCardVariants;
}

/**
 * Exported publicly via the EntityAboutCard
 */
export function AboutCard(props: AboutCardProps) {
  const { variant } = props;
  const classes = useStyles();
  const { entity } = useEntity();
  const scmIntegrationsApi = useApi(scmIntegrationsApiRef);
  const catalogApi = useApi(catalogApiRef);
  const alertApi = useApi(alertApiRef);

  const entitySourceLocation = getEntitySourceLocation(
    entity,
    scmIntegrationsApi,
  );
  const entityMetadataEditUrl =
    entity.metadata.annotations?.[ANNOTATION_EDIT_URL];

  const viewInSource: IconLinkVerticalProps = {
    label: 'View Source',
    disabled: !entitySourceLocation,
    icon: <ScmIntegrationIcon type={entitySourceLocation?.integrationType} />,
    href: entitySourceLocation?.locationTargetUrl,
  };
  const viewInTechDocs: IconLinkVerticalProps = {
    label: 'View TechDocs',
    disabled:
      !entity.metadata.annotations?.hasOwnProperty('backstage.io/techdocs-ref'),
    icon: <DocsIcon />,
    href: `/catalog/${entity.metadata.namespace ?? DEFAULT_NAMESPACE }/${entity.kind}/${entity.metadata.name}/docs`
      // viewTechdocLink &&
      // viewTechdocLink({
      //   namespace: entity.metadata.namespace || DEFAULT_NAMESPACE,
      //   kind: entity.kind,
      //   name: entity.metadata.name,
      // }),
  };

  let cardClass = '';
  if (variant === 'gridItem') {
    cardClass = classes.gridItemCard;
  } else if (variant === 'fullHeight') {
    cardClass = classes.fullHeightCard;
  }

  let cardContentClass = '';
  if (variant === 'gridItem') {
    cardContentClass = classes.gridItemCardContent;
  } else if (variant === 'fullHeight') {
    cardContentClass = classes.fullHeightCardContent;
  }

  const entityLocation = entity.metadata.annotations?.[ANNOTATION_LOCATION];
  // Limiting the ability to manually refresh to the less expensive locations
  const allowRefresh =
    entityLocation?.startsWith('url:') || entityLocation?.startsWith('file:');
  const refreshEntity = useCallback(async () => {
    await catalogApi.refreshEntity(stringifyEntityRef(entity));
    alertApi.post({ message: 'Refresh scheduled', severity: 'info' });
  }, [catalogApi, alertApi, entity]);

  return (
    <Card className={cardClass}>
      <CardHeader
        title="About"
        action={
          <>
            {allowRefresh && (
              <IconButton
                aria-label="Refresh"
                title="Schedule entity refresh"
                onClick={refreshEntity}
              >
                <CachedIcon />
              </IconButton>
            )}
            <IconButton
              component={Link}
              aria-label="Edit"
              disabled={!entityMetadataEditUrl}
              title="Edit Metadata"
              to={entityMetadataEditUrl ?? '#'}
            >
              <EditIcon />
            </IconButton>
          </>
        }
        subheader={<HeaderIconLinkRow links={[viewInSource, viewInTechDocs]} />} // to do
      />
      <Divider />
      <CardContent className={cardContentClass}>
        <AboutContent entity={entity} />
      </CardContent>
    </Card>
  );
}