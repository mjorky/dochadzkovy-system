using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace dochadzka
{
    /// <summary>
    /// Interaction logic for RemainderWindow.xaml
    /// </summary>
    public partial class ReminderWindow : Window
    {
        public bool CancelReminder { get; private set; }

        public ReminderWindow(DateTime quarter, int days)
        {
            InitializeComponent();

            lblDenDatum.Content = $"o {days} dní ({quarter:dd.MM.yyyy})";
        }

        private void CancelReminder_IsChecked(object sender, RoutedEventArgs e)
        {
            CancelReminder = chkCancelReminder.IsChecked.Value;
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
    }
}
