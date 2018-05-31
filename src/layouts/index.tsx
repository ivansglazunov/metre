import * as React from 'react';
import * as PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import * as graphql from 'graphql';

import Header from '../components/header';
import './index.css';

const Layout: any = ({ children, data }: any) => (
  <div>
    <Helmet
      title={data.site.siteMetadata.title}
      meta={[
        { name: 'description', content: 'Sample' },
        { name: 'keywords', content: 'sample, something' },
      ]}
    />
    <Header siteTitle={data.site.siteMetadata.title} />
    {children()}
  </div>
)

Layout.propTypes = {
  children: PropTypes.func,
}

export default Layout

export const query = graphql`
  query SiteTitleQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
