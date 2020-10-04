import React from 'react';
import PropTypes from 'prop-types';

import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';

import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import { fade } from '@material-ui/core/styles';

import connectComponent from '../../../helpers/connect-component';

const styles = (theme) => ({
  toolbarSearchContainer: {
    zIndex: 10,
    position: 'relative',
    borderRadius: 6,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.paper : theme.palette.primary.dark,
    color: fade(theme.palette.common.white, 0.88),
    flex: 1,
    WebkitAppRegion: 'no-drag',
  },
  toolbarSectionSearch: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    height: 28,
    margin: '0 auto',
  },
  searchBarText: {
    lineHeight: 1.5,
    padding: '0 4px',
    flex: 1,
    userSelect: 'none',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    transform: 'translateY(-1px)',
    fontWeight: 'normal',
  },
  input: {
    font: 'inherit',
    border: 0,
    display: 'block',
    verticalAlign: 'middle',
    whiteSpace: 'normal',
    background: 'none',
    margin: 0,
    color: 'inherit',
    width: '100%',
    '&:focus': {
      outline: 0,
    },
    '&::placeholder': {
      color: fade(theme.palette.common.white, 0.3),
    },
  },
  searchIcon: {
    paddingRight: 6,
    fill: theme.palette.common.white,
  },
  searchButton: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

class SearchBox extends React.Component {
  constructor(props) {
    super(props);

    this.handleFocusSearch = this.handleFocusSearch.bind(this);
  }

  componentDidMount() {
    window.ipcRenderer.on('focus-search', this.handleFocusSearch);

    this.inputBox.focus();
  }

  componentWillUnmount() {
    window.ipcRenderer.removeListener('focus-search', this.handleFocusSearch);
  }

  handleFocusSearch() {
    this.inputBox.focus();
    this.inputBox.select();
  }

  render() {
    const {
      classes,
      searchTerm,
      setSearchTerm,
    } = this.props;

    const clearSearchAction = (
      <>
        {searchTerm.length > 0 && (
          <Tooltip title="Clear search" placement="left">
            <IconButton
              color="inherit"
              size="small"
              aria-label="Clear search"
              onClick={() => setSearchTerm('')}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </>
    );

    return (
      <Paper elevation={0} className={classes.toolbarSearchContainer}>
        <div className={classes.toolbarSectionSearch}>
          <SearchIcon
            className={classes.searchIcon}
            fontSize="small"
          />
          <Typography
            className={classes.searchBarText}
            color="inherit"
            variant="subtitle1"
          >
            <input
              className={classes.input}
              onChange={(e) => setSearchTerm(e.target.value)}
              onInput={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.target.blur();
                  setSearchTerm('');
                }
              }}
              placeholder="Search apps..."
              ref={(inputBox) => { this.inputBox = inputBox; }}
              value={searchTerm}
            />
          </Typography>
          {clearSearchAction}
        </div>
      </Paper>
    );
  }
}

SearchBox.defaultProps = {
  searchTerm: '',
};

SearchBox.propTypes = {
  classes: PropTypes.object.isRequired,
  searchTerm: PropTypes.string,
  setSearchTerm: PropTypes.func.isRequired,
};

export default connectComponent(
  SearchBox,
  null,
  null,
  styles,
);
